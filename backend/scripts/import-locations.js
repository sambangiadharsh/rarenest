const { poolPromise } = require("../src/config/db");
const locations = require("../data/india-states-districts-cities(updated).json");

async function run() {
    try {
        console.log("Connecting to database...");
        const pool = await poolPromise;

        let inserted = 0;

        console.log("Importing locations...");

        for (const item of locations) {
            const state = item.state?.trim();

            if (!state) continue;

            const districts = item.districts || [];
            const cities = item.cities || [];

            // State + District + City
            if (districts.length && cities.length) {
                for (const district of districts) {
                    for (const city of cities) {
                        await pool.request()
                            .input("state", state)
                            .input("district", district.trim())
                            .input("city", city.trim())
                            .query(`
                                IF NOT EXISTS (
                                    SELECT 1
                                    FROM Locations
                                    WHERE StateName = @state
                                      AND DistrictName = @district
                                      AND CityName = @city
                                )
                                BEGIN
                                    INSERT INTO Locations (
                                        StateName,
                                        DistrictName,
                                        CityName
                                    )
                                    VALUES (
                                        @state,
                                        @district,
                                        @city
                                    )
                                END
                            `);

                        inserted++;
                    }
                }
            }

            // State + District only
            else if (districts.length) {
                for (const district of districts) {
                    await pool.request()
                        .input("state", state)
                        .input("district", district.trim())
                        .query(`
                            IF NOT EXISTS (
                                SELECT 1
                                FROM Locations
                                WHERE StateName = @state
                                  AND DistrictName = @district
                                  AND CityName IS NULL
                            )
                            BEGIN
                                INSERT INTO Locations (
                                    StateName,
                                    DistrictName
                                )
                                VALUES (
                                    @state,
                                    @district
                                )
                            END
                        `);

                    inserted++;
                }
            }

            // State + City only
            else if (cities.length) {
                for (const city of cities) {
                    await pool.request()
                        .input("state", state)
                        .input("city", city.trim())
                        .query(`
                            IF NOT EXISTS (
                                SELECT 1
                                FROM Locations
                                WHERE StateName = @state
                                  AND DistrictName IS NULL
                                  AND CityName = @city
                            )
                            BEGIN
                                INSERT INTO Locations (
                                    StateName,
                                    CityName
                                )
                                VALUES (
                                    @state,
                                    @city
                                )
                            END
                        `);

                    inserted++;
                }
            }
        }

        console.log(`Import completed successfully.`);
        console.log(`Processed ${inserted} location records.`);

        process.exit(0);

    } catch (err) {
        console.error("Import failed:", err);
        process.exit(1);
    }
}

run();