import noblox from "noblox.js";

export async function getRobloxUsername(id: number | bigint) {
  try {
    return await noblox.getUsernameFromId(Number(id));
  } catch (error) {
    console.error(`Error getting username for user ${id}:`, error);
    return "Unknown User";
  }
}

export async function getRobloxThumbnail(id: number | bigint) {
  try {
    return (await noblox.getPlayerThumbnail(Number(id), "720x720", "png", false, "headshot"))[0].imageUrl;
  } catch (error) {
    console.error(`Error getting thumbnail for user ${id}:`, error);
    return ""
  }
}

export async function getRobloxDisplayName(id: number | bigint) {
  try {
    const username = await noblox.getUsernameFromId(Number(id));
    if (!username) {
      return "Unknown User";
    }
    
    try {
      const playerInfo = await noblox.getPlayerInfo(Number(id));
      return playerInfo.displayName;
    } catch (innerError) {
      console.error(`Error getting player info for user ${id}:`, innerError);
      // If we can't get display name, use username as fallback
      return username;
    }
  } catch (error) {
    console.error(`Error getting username for user ${id}:`, error);
    return "Unknown User";
  }
}

// origin is not used anymore, but we need to keep it for backwards compatibility
export async function getRobloxUserId(username: string, origin?: string): Promise<number> {
  try {
    const id = await noblox.getIdFromUsername(username);
    return id;
  } catch (error) {
    console.error(`Error getting user ID for username ${username}:`, error);
    throw error; // re-throw this error for authentication
  }
}