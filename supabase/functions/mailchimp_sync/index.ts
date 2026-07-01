// const MAILCHIMP_API_KEY = Deno.env.get("MAILCHIMP_API_KEY");
// const MAILCHIMP_AUDIENCE_ID = Deno.env.get("MAILCHIMP_AUDIENCE_ID");

// if (!MAILCHIMP_API_KEY || !MAILCHIMP_AUDIENCE_ID) {
//   throw new Error("Missing Mailchimp environment variables");
// }

// // Extract data center (e.g. us21 from xxxx-us21)
// const MAILCHIMP_DATA_CENTER = MAILCHIMP_API_KEY.split("-")[1];

// Deno.serve(async (req) => {
//   try {
//     const payload = await req.json();

//     console.log("Incoming payload:", payload);

//     // Supabase Database Webhook structure
//     const email = payload?.record?.email;
//     const fullName = payload?.record?.full_name;
//     if (!email || !fullName) {
//       return new Response(
//         JSON.stringify({
//           error: "No email or full name found in payload",
//         }),
//         {
//           status: 400,
//           headers: {
//             "Content-Type": "application/json",
//           },
//         },
//       );
//     }

//     const mailchimpUrl = `https://${MAILCHIMP_DATA_CENTER}.api.mailchimp.com/3.0/lists/${MAILCHIMP_AUDIENCE_ID}/members`;

//     const mailchimpResponse = await fetch(mailchimpUrl, {
//       method: "POST",
//       headers: {
//         Authorization: `apikey ${MAILCHIMP_API_KEY}`,
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         email_address: email,
//         status: "subscribed",
//         merge_fields: {
//           FNAME: fullName,
//         },
//       }),
//     });

//     const result = await mailchimpResponse.json();

//     if (!mailchimpResponse.ok) {
//       console.error("Mailchimp Error:", result);

//       return new Response(
//         JSON.stringify({
//           success: false,
//           error: result.detail || "Mailchimp subscription failed",
//         }),
//         {
//           status: mailchimpResponse.status,
//           headers: {
//             "Content-Type": "application/json",
//           },
//         },
//       );
//     }

//     return new Response(
//       JSON.stringify({
//         success: true,
//         data: result,
//       }),
//       {
//         status: 200,
//         headers: {
//           "Content-Type": "application/json",
//         },
//       },
//     );
//   } catch (error) {
//     console.error("Function Error:", error);

//     return new Response(
//       JSON.stringify({
//         success: false,
//         error: error instanceof Error ? error.message : "Unknown error",
//       }),
//       {
//         status: 500,
//         headers: {
//           "Content-Type": "application/json",
//         },
//       },
//     );
//   }
// });

import { Resend } from "resend";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

if (!RESEND_API_KEY) {
  throw new Error("Missing RESEND_API_KEY");
}

const resend = new Resend(RESEND_API_KEY);

Deno.serve(async (req) => {
  try {
    const payload = await req.json();

    console.log("Incoming payload:", payload);

    // Only process INSERT events
    if (payload?.type && payload.type !== "INSERT") {
      return Response.json({
        success: true,
        message: "Ignoring non-insert event",
      });
    }

    const email = payload?.record?.email;
    const fullName = payload?.record?.full_name;

    if (!email || !fullName) {
      return new Response(
        JSON.stringify({
          error: "Missing email or full name",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    // Welcome email to user
    const { data, error } = await resend.emails.send({
      from: "SkilLoop <hello@mail.skil-loop.com>",
      replyTo: "hello@skil-loop.com",
      to: email,
      subject: "🎉 You're on the SkilLoop waitlist!",
      html: `
              <div style="
                font-family: Arial, Helvetica, sans-serif;
                max-width: 600px;
                margin: 0 auto;
                color: #1e293b;
                line-height: 1.6;
                background:#ffffff;
              ">

                <!-- Header -->
                <div style="
                  background:#f8fafc;
                  padding:25px 20px;
                  text-align:center;
                  border-bottom:1px solid #e2e8f0;
                ">
                  <img
                    src="https://www.skil-loop.com/images/SkilLoop.png"
                    alt="SkilLoop"
                    width="140"
                    style="max-width:140px;"
                  />
                </div>


                <!-- Body -->
                <div style="
                  padding:30px 20px;
                ">

                  <h1 style="
                    text-align:center;
                    color:#0f172a;
                    margin-bottom:25px;
                  ">
                    Welcome to SkilLoop, ${fullName}🚀
                  </h1>


                 <p>Thanks for joining our waitlist.</p> 
                 <p> You’re now part of a growing community built around exchanging skills, learning from others, and creating meaningful connections.</p> 
                 <p> We’re excited to have you with us as we build a new way for people to share knowledge, discover opportunities, and grow together. </p> 
                  <div style="text-align:center; margin:25px 0;">
                    <a
                      href="https://chat.whatsapp.com/J4zhoYLwqOUGXzVG8fujRV"
                        style="
                          background:#25D366;
                          color:#ffffff;
                          text-decoration:none;
                          padding:12px 24px;
                          border-radius:8px;
                          font-weight:bold;
                          display:inline-block;
                        "
                    >
                      Join Our WhatsApp Community
                    </a>
                  </div>                 
                  <p> See you inside🚀,<br /> The SkilLoop Team </p>
                 </div>


                </div>



                <!-- Footer -->
                <div style="
                  background:#0f172a;
                  padding:25px 20px;
                  text-align:center;
                  color:#ffffff;
                  border-radius:0 0 12px 12px;
                ">

                  <img
                    src="https://www.skil-loop.com/images/SkilLoop.png"
                    alt="SkilLoop"
                    width="140"
                    style="max-width:140px; margin-bottom:15px;"
                  />


                  <p style="
                    margin:5px 0;
                    color:#cbd5e1;
                  ">
                    Building the future with SkilLoop 🚀
                  </p>


                  <div style="
                    text-align:center;
                    margin:20px 0;
                  ">
                    <a href="https://vm.tiktok.com/ZS9jP4SHcoddC-TBqey/" target="_blank" style="text-decoration:none; display:inline-block; margin:0 10px;">
                      <img src="https://cdn.simpleicons.org/tiktok/white" alt="TikTok" width="24" height="24" style="display:block; border:none;" />
                    </a>
                    <a href="https://www.instagram.com/getskilloop?igsh=aGltMHhjeGNjZmZh" target="_blank" style="text-decoration:none; display:inline-block; margin:0 10px;">
                      <img src="https://cdn.simpleicons.org/instagram/white" alt="Instagram" width="24" height="24" style="display:block; border:none;" />
                    </a>
                    <a href="https://x.com/SkilLoop0" target="_blank" style="text-decoration:none; display:inline-block; margin:0 10px;">
                      <img src="https://cdn.simpleicons.org/x/white" alt="X" width="20" height="20" style="display:block; border:none;" />
                    </a>
                    <a href="https://www.linkedin.com/company/getskilloop/" target="_blank" style="text-decoration:none; display:inline-block; margin:0 10px;">
                      <img src="https://img.icons8.com/?size=100&id=447&format=png&color=ffffff" alt="LinkedIn" width="24" height="24" style="display:block; border:none;" />
                    </a>
                  </div>


                  <hr style="
                    border:none;
                    border-top:1px solid #334155;
                    margin:25px 0;
                  " />

                  <p style="
                    margin:0;
                    font-size:14px;
                    color:#cbd5e1;
                  ">
                    © 2026 SkilLoop. All rights reserved.
                  </p>


                </div>


              </div>
            `,
    });

    if (error) {
      console.error("Resend Error:", error);

      return new Response(
        JSON.stringify({
          success: false,
          error,
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    // Admin notification email
    try {
      await resend.emails.send({
        from: "SkilLoop <hello@mail.skil-loop.com>",
        replyTo: "hello@skil-loop.com",
        to: "hello@skil-loop.com",
        subject: "🎉 New Waitlist Signup",
        html: `
      <div style="font-family: Arial, sans-serif;">
        <h2>🎉 New Waitlist Signup</h2>

        <p><strong>Name:</strong> ${fullName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Joined:</strong> ${new Date().toLocaleString()}</p>

        <hr />

        <p>A new user has joined the SkilLoop waitlist.</p>
      </div>
    `,
      });
    } catch (adminError) {
      console.error("Admin notification failed:", adminError);
    }

    console.log("Email sent successfully:", data);

    return new Response(
      JSON.stringify({
        success: true,
        data,
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
