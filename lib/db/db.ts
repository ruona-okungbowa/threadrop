import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { awsCredentialsProvider } from "@vercel/functions/oidc";

const region = process.env.AWS_REGION;
const roleArn = process.env.AWS_ROLE_ARN;

const client = new DynamoDBClient({
  region,
  ...(roleArn
    ? {
        credentials: awsCredentialsProvider({
          roleArn,
          clientConfig: { region },
        }),
      }
    : {}),
});

export const docClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: { removeUndefinedValues: true },
});

/** Single-table name; overridable via env, defaults to the spec name. */
export const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME ?? "threadrop";
