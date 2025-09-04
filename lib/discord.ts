interface DiscordWebhookPayload {
  content?: string
  embeds?: Array<{
    title?: string
    description?: string
    color?: number
    fields?: Array<{
      name: string
      value: string
      inline?: boolean
    }>
    thumbnail?: {
      url: string
    }
    timestamp?: string
  }>
}

export async function sendDiscordNotification(payload: DiscordWebhookPayload) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL

  if (!webhookUrl) {
    console.warn("Discord webhook URL not configured")
    return
  }

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      throw new Error(`Discord webhook failed: ${response.status}`)
    }

    console.log("Discord notification sent successfully")
  } catch (error) {
    console.error("Error sending Discord notification:", error)
  }
}

export async function notifyNewFont(font: any, seller: any) {
  const payload: DiscordWebhookPayload = {
    embeds: [
      {
        title: "🎨 New Font Available!",
        description: `**${font.name}** has been added to FontMarket`,
        color: 0x3b82f6, // Blue color
        fields: [
          {
            name: "Designer",
            value: `${seller.firstName} ${seller.lastName}`,
            inline: true,
          },
          {
            name: "Category",
            value: font.category || "Uncategorized",
            inline: true,
          },
          {
            name: "Price",
            value: font.isFree ? "Free" : `$${font.price}`,
            inline: true,
          },
          {
            name: "Description",
            value: font.description || "No description provided",
            inline: false,
          },
        ],
        thumbnail: {
          url: font.previewImage || "https://via.placeholder.com/150",
        },
        timestamp: new Date().toISOString(),
      },
    ],
  }

  await sendDiscordNotification(payload)
}

export async function notifyFontPurchase(font: any, buyer: any, seller: any, amount: number) {
  const payload: DiscordWebhookPayload = {
    embeds: [
      {
        title: "💰 Font Purchase!",
        description: `**${font.name}** has been purchased`,
        color: 0x10b981, // Green color
        fields: [
          {
            name: "Buyer",
            value: `${buyer.firstName} ${buyer.lastName}`,
            inline: true,
          },
          {
            name: "Seller",
            value: `${seller.firstName} ${seller.lastName}`,
            inline: true,
          },
          {
            name: "Amount",
            value: `$${amount}`,
            inline: true,
          },
        ],
        timestamp: new Date().toISOString(),
      },
    ],
  }

  await sendDiscordNotification(payload)
}

export async function notifyFontSponsored(font: any, seller: any, amount: number, duration: number) {
  const payload: DiscordWebhookPayload = {
    embeds: [
      {
        title: "⭐ Font Sponsored!",
        description: `**${font.name}** is now sponsored`,
        color: 0xf59e0b, // Yellow color
        fields: [
          {
            name: "Designer",
            value: `${seller.firstName} ${seller.lastName}`,
            inline: true,
          },
          {
            name: "Sponsor Amount",
            value: `$${amount}`,
            inline: true,
          },
          {
            name: "Duration",
            value: `${duration} days`,
            inline: true,
          },
        ],
        timestamp: new Date().toISOString(),
      },
    ],
  }

  await sendDiscordNotification(payload)
}
