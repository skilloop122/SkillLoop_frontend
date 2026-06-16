const MAILCHIMP_API_KEY = Deno.env.get("MAILCHIMP_API_KEY");
const MAILCHIMP_AUDIENCE_ID = Deno.env.get("MAILCHIMP_AUDIENCE_ID");

if (!MAILCHIMP_API_KEY || !MAILCHIMP_AUDIENCE_ID) {
  throw new Error("Missing Mailchimp environment variables");
}

// Extract data center (e.g. us21 from xxxx-us21)
const MAILCHIMP_DATA_CENTER = MAILCHIMP_API_KEY.split("-")[1];

Deno.serve(async (req) => {
  try {
    const payload = await req.json();

    console.log("Incoming payload:", payload);

    // Supabase Database Webhook structure
    const email = payload?.record?.email;
    const fullName = payload?.record?.full_name;
    if (!email || !fullName) {
      return new Response(
        JSON.stringify({
          error: "No email or full name found in payload",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    const mailchimpUrl = `https://${MAILCHIMP_DATA_CENTER}.api.mailchimp.com/3.0/lists/${MAILCHIMP_AUDIENCE_ID}/members`;

    const mailchimpResponse = await fetch(mailchimpUrl, {
      method: "POST",
      headers: {
        Authorization: `apikey ${MAILCHIMP_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email_address: email,
        status: "subscribed",
        merge_fields: {
          FNAME: fullName,
        },
      }),
    });

    const result = await mailchimpResponse.json();

    if (!mailchimpResponse.ok) {
      console.error("Mailchimp Error:", result);

      return new Response(
        JSON.stringify({
          success: false,
          error: result.detail || "Mailchimp subscription failed",
        }),
        {
          status: mailchimpResponse.status,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: result,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error) {
    console.error("Function Error:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }
});
