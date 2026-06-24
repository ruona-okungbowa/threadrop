import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { awsCredentialsProvider } from "@vercel/functions/oidc";

const region = process.env.AWS_REGION;
const roleArn = process.env.AWS_ROLE_ARN;

// On Vercel, assume the IAM role via OIDC (no static keys in the bundle). Locally
// (no AWS_ROLE_ARN), fall back to the default credential chain — SSO / profile /
// env vars — so `next dev` can reach the table without the Vercel runtime.
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
