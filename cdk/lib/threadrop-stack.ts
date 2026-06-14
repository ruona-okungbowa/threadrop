import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as cdk from "aws-cdk-lib";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as nodejs from "aws-cdk-lib/aws-lambda-nodejs";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as iam from "aws-cdk-lib/aws-iam";
import * as s3Deployment from "aws-cdk-lib/aws-s3-deployment";

/**
 * Defines the custom settings Threadrop stacks accepts
 */
export interface ThreadropSettings extends StackProps {
  tableName?: string;
  tableArn?: string;
  tableStreamArn?: string;
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
    });

    imagesBucket.addToResourcePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.DENY,
        actions: ["s3:*"],
      }),
    );

    // ----------------------------------------
    // Dynamo DB
    // ----------------------------------------
    const table = dynamodb.Table.fromTableAttributes(this, "threadrop-table", {
      tableName: props.tableName,
      tableStreamArn: props.tableStreamArn,
      tableArn: props.tableArn,
    });

    // ----------------------------------------
    // Lambda
    // ----------------------------------------
    const bundling = {
      externalModules: ["aws-sdk"],
    };

    const restockLambda = new nodejs.NodejsFunction(this, "redtock-lambda", {
      functionName: `threadrop-restock-lambda`,
      runtime: lambda.Runtime.NODEJS_22_X,
      entry: "cdk/functions/utility-functions.ts",
      handler: "restockHandler",
      bundling,
    });

    // ----------------------------------------
    // Outputs
    // ----------------------------------------
    new cdk.CfnOutput(this, "S3Bucket", {
      value: restockLambda.functionName,
    });
  }
}
