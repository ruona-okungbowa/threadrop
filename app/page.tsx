import { docClient } from "@/lib/db/db";
import { ScanCommand } from "@aws-sdk/lib-dynamodb";

export default async function Page() {
  const response = await docClient.send(
    new ScanCommand({
      TableName: process.env.DYNAMODB_TABLE_NAME,
    }),
  );
  const items = response.Items ?? [];

  return (
    <main className="main">
      <h1 className="title">Next.js + DynamoDB</h1>

      <div className="container">
        <p>{items.length} item(s) in table</p>
        {items.map((item, i) => (
          <pre key={i}>{JSON.stringify(item, null, 2)}</pre>
        ))}
      </div>
    </main>
  );
}
