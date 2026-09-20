import { getAnonClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = getAnonClient();
    
    // Simple lightweight query to touch database and prevent pausing/sleeping
    const { error } = await supabase
      .from("categories")
      .select("id")
      .limit(1);

    if (error) {
      console.error("[Keep-Alive/Ping] Database query error:", error);
      return Response.json(
        { status: "error", message: "Database query failed", error: error.message },
        { status: 500 }
      );
    }

    return Response.json({
      status: "alive",
      timestamp: new Date().toISOString(),
      queried: true,
      message: "Database pinged successfully"
    });
  } catch (err) {
    console.error("[Keep-Alive/Ping] Unexpected error:", err);
    return Response.json(
      { status: "error", message: "Internal server error" },
      { status: 500 }
    );
  }
}
