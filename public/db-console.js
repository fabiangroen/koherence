async function queryDb(query) {
    try {
        const response = await fetch("/api/db", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ query }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Error: ${response.status} ${response.statusText}`, errorText);
            return;
        }

        const result = await response.json();
        console.log("Query result:", result);
    } catch (error) {
        console.error("An unexpected error occurred:", error);
    }
}

console.log("Database console is ready. Use queryDb('YOUR_SQL_QUERY') to interact with the database.");