import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as cdk from "aws-cdk-lib";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as nodejs from "aws-cdk-lib/aws-lambda-nodejs";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as iam from "aws-cdk-lib/aws-iam";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";
import * as eventsources from "aws-cdk-lib/aws-lambda-event-sources";
import * as sqs from "aws-cdk-lib/aws-sqs";

/**
 * Custom settings the Threadrop stack accepts.
 */
export interface ThreadropSettings extends StackProps {
  oidcRoleArn?: string;
}

export class ThreadropStack extends Stack {
  constructor(scope: Construct, id: string, props: ThreadropSettings) {
    super(scope, id, props);

    // ---------------------------------------
    // Tags
    // ---------------------------------------
    cdk.Tags.of(this).add("Owner", "Ruona");
    cdk.Tags.of(this).add("Project", "Threadrop");

    // ---------------------------------------
    // S3 Bucket
    // ---------------------------------------
    const imagesBucket = new s3.Bucket(this, "images-bucket", {
      // Private by default, the app serves images via GET URLs
      bucketName: "threadrop-images",
      // Keep images if the stack is torn down
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      enforceSSL: true,
      cors: [
        {
          // Browser uploads via presigned PUT urls
          allowedMethods: [
            s3.HttpMethods.PUT,
            s3.HttpMethods.GET,
            s3.HttpMethods.HEAD,
          ],
          allowedOrigins: ["*"],
          allowedHeaders: ["*"],
          maxAge: 3000,
        },
      ],
    });

    // ----------------------------------------
    // CloudFront distribution
    // ----------------------------------------
    const imagesDistribution = new cloudfront.Distribution(
      this,
      "threadrop-images-distribution",
      {
        defaultBehavior: {
          origin: origins.S3BucketOrigin.withOriginAccessControl(imagesBucket),
          viewerProtocolPolicy:
            cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
        },
      },
    );

    // ----------------------------------------
    // DynamoDB
    // ----------------------------------------
    const resourceArn = process.env.AWS_RESOURCE_ARN;
    if (!resourceArn) {
      throw new Error("AWS_RESOURCE_ARN environment variable is required");
    }

    const threadropTable = dynamodb.Table.fromTableArn(
      this,
      "threadrop-table",
      resourceArn,
    );

    // ----------------------------------------
    // Lambda
    // ----------------------------------------
    const bundling = {
      externalModules: ["@aws-sdk/*"],
    };

    const restockDlq = new sqs.Queue(this, "restock-dlq", {
      queueName: "threadrop-restock-dlq",
      retentionPeriod: cdk.Duration.days(14),
      enforceSSL: true,
    });

    const restockLambda = new nodejs.NodejsFunction(this, "restock-lambda", {
      functionName: `threadrop-restock-lambda`,
      runtime: lambda.Runtime.NODEJS_22_X,
      entry: "functions/utility-functions.ts",
      handler: "restockHandler",
      timeout: cdk.Duration.seconds(30),
      environment: {
        // The handler reads/writes this table name from the environment.
        DYNAMODB_TABLE_NAME: threadropTable.tableName,
      },
      bundling,
    });

    threadropTable.grantReadWriteData(restockLambda);
    threadropTable.grantStreamRead(restockLambda);

    restockLambda.addEventSource(
      new eventsources.DynamoEventSource(threadropTable, {
        startingPosition: lambda.StartingPosition.LATEST,
        batchSize: 10,
        maxBatchingWindow: cdk.Duration.seconds(2),
        retryAttempts: 3,
        bisectBatchOnError: true,
        onFailure: new eventsources.SqsDlq(restockDlq),
        filters: [
          lambda.FilterCriteria.filter({
            eventName: lambda.FilterRule.isEqual("REMOVE"),
          }),
        ],
      }),
    );

    // ----------------------------------------
    // Vercel OIDC role grants (the app's runtime identity)
    // ----------------------------------------
    // Only wire the role when its ARN is provided (also narrows string|undefined).
    if (props.oidcRoleArn) {
      const oidcRole = iam.Role.fromRoleArn(
        this,
        "VercelOidcRole",
        props.oidcRoleArn,
        { mutable: true },
      );

      threadropTable.grantReadWriteData(oidcRole);
      imagesBucket.grantPut(oidcRole);
    }

    // ----------------------------------------
    // Outputs
    // ----------------------------------------
    new cdk.CfnOutput(this, "TableName", { value: threadropTable.tableName });
    new cdk.CfnOutput(this, "TableArn", { value: threadropTable.tableArn });
    new cdk.CfnOutput(this, "ImagesDistributionDomain", {
      value: imagesDistribution.distributionDomainName,
    });
    new cdk.CfnOutput(this, "RestockLambda", {
      value: restockLambda.functionName,
    });
  }
}
