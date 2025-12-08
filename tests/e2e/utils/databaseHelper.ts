/**
 * Database helper for Oracle database operations in e2e tests.
 *
 * Used by globalSetup to clean test data before initializing new test cases.
 * This keeps SQL delete logic out of production code (melosys-api).
 *
 * Usage:
 *   const db = new DatabaseHelper();
 *   await db.connect();
 *   await db.cleanDatabase();
 *   await db.close();
 *
 * Or with the helper function:
 *   await withDatabase(async (db) => {
 *     await db.cleanDatabase();
 *   });
 */
import oracledb, { BindParameters } from "oracledb";

export class DatabaseHelper {
  private connection: oracledb.Connection | null = null;

  /**
   * Connect to Oracle database running in Docker Compose
   */
  async connect(): Promise<void> {
    if (this.connection) {
      return;
    }

    try {
      this.connection = await oracledb.getConnection({
        user: process.env.DB_USER || "MELOSYS",
        password: process.env.DB_PASSWORD || "melosyspwd",
        connectString: process.env.DB_CONNECT_STRING || "localhost:1521/freepdb1",
      });

      // eslint-disable-next-line no-console
      console.log("  Connected to Oracle database");
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("  Failed to connect to database:", error);
      throw error;
    }
  }

  /**
   * Execute a query
   * @param sql
   * @param binds
   * @param suppressErrors - If true, don't log errors to console
   */
  async query<T = Record<string, unknown>>(
    sql: string,
    binds: BindParameters = [],
    suppressErrors = false,
  ): Promise<T[]> {
    if (!this.connection) {
      throw new Error("Database not connected. Call connect() first.");
    }

    try {
      const result = await this.connection.execute(sql, binds, {
        outFormat: oracledb.OUT_FORMAT_OBJECT,
      });

      return (result.rows || []) as T[];
    } catch (error) {
      if (!suppressErrors) {
        // eslint-disable-next-line no-console
        console.error("  Query failed:", error);
      }
      throw error;
    }
  }

  /**
   * Clean test data for e2e tests (MEL-1001 to MEL-1071).
   * Uses TRUNCATE for speed, but only on tables that contain test data.
   *
   * This is a targeted cleanup that removes only e2e test data,
   * not all data in the database.
   */
  async cleanTestData(): Promise<{ tablesCleared: number; rowsDeleted: number }> {
    if (!this.connection) {
      throw new Error("Database not connected. Call connect() first.");
    }

    // eslint-disable-next-line no-console
    console.log("  Cleaning e2e test data (MEL-1001 to MEL-1071)...");

    const saksnummerListe = Array.from({ length: 71 }, (_, i) => `MEL-${1001 + i}`);
    const saksnummerIn = saksnummerListe.map((s) => `'${s}'`).join(",");

    // Find behandling IDs for test cases
    interface BehandlingRow {
      ID: number;
    }
    const behandlingResult = await this.query<BehandlingRow>(
      `SELECT id FROM behandling WHERE saksnummer IN (${saksnummerIn})`,
      [],
      true,
    );

    if (behandlingResult.length === 0) {
      // eslint-disable-next-line no-console
      console.log("  No test data found - nothing to clean");
      return { tablesCleared: 0, rowsDeleted: 0 };
    }

    const behandlingIdIn = behandlingResult.map((r) => r.ID).join(",");
    // eslint-disable-next-line no-console
    console.log(`  Found ${behandlingResult.length} test cases to clean`);

    // Delete in correct order (children first, parents last)
    // Order is critical due to foreign key constraints
    const deleteStatements = [
      // Level 1: Deepest children (trygdeavgiftsperiode has FK to multiple tables)
      `DELETE FROM trygdeavgiftsperiode WHERE medlemskapsperiode_id IN (SELECT id FROM medlemskapsperiode WHERE behandlingsresultat_id IN (${behandlingIdIn}))`,
      `DELETE FROM trygdeavgiftsperiode WHERE helseutgift_dekkes_periode_id IN (SELECT id FROM helseutgift_dekkes_periode WHERE beh_resultat_id IN (${behandlingIdIn}))`,
      `DELETE FROM trygdeavgiftsperiode WHERE lovvalg_periode_id IN (SELECT id FROM lovvalg_periode WHERE beh_resultat_id IN (${behandlingIdIn}))`,

      // Level 2: medlemskapsperiode
      `DELETE FROM medlemskapsperiode WHERE behandlingsresultat_id IN (${behandlingIdIn})`,

      // Level 3: Child tables of behandlingsresultat with column "beh_resultat_id"
      `DELETE FROM utpekingsperiode WHERE beh_resultat_id IN (${behandlingIdIn})`,
      `DELETE FROM anmodningsperiode WHERE beh_resultat_id IN (${behandlingIdIn})`,
      `DELETE FROM kontrollresultat WHERE beh_resultat_id IN (${behandlingIdIn})`,
      `DELETE FROM avklartefakta WHERE beh_resultat_id IN (${behandlingIdIn})`,
      `DELETE FROM lovvalg_periode WHERE beh_resultat_id IN (${behandlingIdIn})`,
      `DELETE FROM vilkaarsresultat WHERE beh_resultat_id IN (${behandlingIdIn})`,
      `DELETE FROM behandlingsres_begrunnelse WHERE beh_resultat_id IN (${behandlingIdIn})`,
      `DELETE FROM helseutgift_dekkes_periode WHERE beh_resultat_id IN (${behandlingIdIn})`,

      // Level 3: Child tables with column "behandlingsresultat_id"
      `DELETE FROM aarsavregning WHERE behandlingsresultat_id IN (${behandlingIdIn})`,
      `DELETE FROM vedtak_metadata WHERE behandlingsresultat_id IN (${behandlingIdIn})`,

      // Level 4: behandlingsresultat
      `DELETE FROM behandlingsresultat WHERE behandling_id IN (${behandlingIdIn})`,

      // Level 5: saksopplysning_kilde
      `DELETE FROM saksopplysning_kilde WHERE saksopplysning_id IN (SELECT id FROM saksopplysning WHERE behandling_id IN (${behandlingIdIn}))`,

      // Level 6: Tables with direct FK to behandling.id
      `DELETE FROM saksopplysning WHERE behandling_id IN (${behandlingIdIn})`,
      `DELETE FROM tidligere_medlemsperiode WHERE behandling_id IN (${behandlingIdIn})`,
      `DELETE FROM mottatteopplysninger WHERE behandling_id IN (${behandlingIdIn})`,
      `DELETE FROM behandlingsaarsak WHERE behandling_id IN (${behandlingIdIn})`,

      // Level 7: prosessinstans chain
      `DELETE FROM prosessinstans_hendelser WHERE prosessinstans_id IN (SELECT uuid FROM prosessinstans WHERE behandling_id IN (${behandlingIdIn}))`,
      `DELETE FROM prosessinstans WHERE behandling_id IN (${behandlingIdIn})`,

      // Level 8: behandling
      `DELETE FROM behandling WHERE id IN (${behandlingIdIn})`,

      // Level 9: aktoer
      `DELETE FROM aktoer WHERE saksnummer IN (${saksnummerIn})`,

      // Level 10: fagsak
      `DELETE FROM fagsak WHERE saksnummer IN (${saksnummerIn})`,
    ];

    let tablesCleared = 0;
    let totalRowsDeleted = 0;

    for (const sql of deleteStatements) {
      try {
        const result = await this.connection.execute(sql, [], { autoCommit: false });
        const rowsAffected = result.rowsAffected || 0;
        if (rowsAffected > 0) {
          tablesCleared++;
          totalRowsDeleted += rowsAffected;
        }
      } catch (error: unknown) {
        // Ignore "table does not exist" errors (ORA-00942)
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (!errorMessage.includes("ORA-00942")) {
          throw error;
        }
      }
    }

    // Commit all deletes
    await this.connection.commit();

    // eslint-disable-next-line no-console
    console.log(`  Cleaned ${tablesCleared} tables, ${totalRowsDeleted} rows deleted`);
    return { tablesCleared, rowsDeleted: totalRowsDeleted };
  }

  /**
   * Close the database connection
   */
  async close(): Promise<void> {
    if (this.connection) {
      try {
        await this.connection.close();
        this.connection = null;
        // eslint-disable-next-line no-console
        console.log("  Database connection closed");
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("  Failed to close database:", error);
        throw error;
      }
    }
  }
}

/**
 * Helper function to create a database fixture for tests
 */
export async function withDatabase<T>(callback: (db: DatabaseHelper) => Promise<T>): Promise<T> {
  const db = new DatabaseHelper();
  try {
    await db.connect();
    return await callback(db);
  } finally {
    await db.close();
  }
}
