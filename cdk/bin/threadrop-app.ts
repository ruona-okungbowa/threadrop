#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { ThreadropStack } from "../lib/threadrop-stack";

const app = new cdk.App();

new ThreadropStack(app, "Threadrop-Stack", {
  // CDK resolves account/region from the deploying credentials/profile.
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
  // The Vercel OIDC role to grant table + image access (optional).
  oidcRoleArn: process.env.AWS_ROLE_ARN,
});
