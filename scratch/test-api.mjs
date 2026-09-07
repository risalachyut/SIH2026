async function test() {
  try {
    const res = await fetch("http://localhost:3000/api/rag/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: "help me with employment guidance", history: [] })
    });
    const data = await res.text();
    console.log("Status:", res.status);
    console.log("Data:", data);
  } catch (err) {
    console.error("Error:", err);
  }
}
test();
