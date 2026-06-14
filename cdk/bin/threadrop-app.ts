#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { ThreadropStack } from "../lib/threadrop-stack";

const settings = {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT || "NOT_SET",
    region: process.env.CDK_DEFAULT_REGION || "NOT_SET",
  },
  tableName: process.env.DYNAMODB_TABLE_NAME,
  tableStreamArn: process.env.DYNAMODB_STREAM_ARN,
  tableArn: process.env.DYNAMODB_TABLE_ARN,
  oidcRoleArn: process.env.AWS_ROLE_ARN,
};

const app = new cdk.App();

new ThreadropStack(app, "Threadrop-Stack", {
  env: settings.env,
  tableStreamArn: settings.tableStreamArn,
  tableArn: settings.tableArn,
  oidcRoleArn: settings.oidcRoleArn,
  tableName: settings.tableName,
});
