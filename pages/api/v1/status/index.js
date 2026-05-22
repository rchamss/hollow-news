import database from "infra/database.js";

async function status(request, response) {
  const updatedAt = new Date().toISOString();
  const postgVer = await database.query("SHOW server_version;");
  const maxConnections = await database.query("SHOW max_connections;")
  const databaseOpenedConnections = await database.query({
    text: "SELECT count(*)::int FROM pg_stat_activity WHERE datname = $1;",
    values: [process.env.POSTGRES_DB]
  })
  const databaseOpenedConnectionsValue = databaseOpenedConnections.rows[0].count
  console.log(databaseOpenedConnectionsValue)

  response.status(200).json({
    updated_at: updatedAt,
    dependencies: {
      database: {
        postgres_version: postgVer.rows[0].server_version,
        max_connections: maxConnections.rows[0].max_connections,
        opened_connections: databaseOpenedConnectionsValue,
      }
    }
  });
}

export default status;
