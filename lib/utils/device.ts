// ua-parser-js ships CJS; use require to avoid ESM interop "no construct signatures" error
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { UAParser } = require("ua-parser-js") as {
  UAParser: new (ua?: string) => {
    getResult(): {
      browser: { name?: string; version?: string };
      os: { name?: string; version?: string };
      device: { type?: string; vendor?: string; model?: string };
    };
  };
};

/** Parsed device information from User-Agent string */
export interface ParsedDevice {
  deviceName: string;
  browser: string;
  os: string;
}

/**
 * Parses a User-Agent string into structured device, browser, and OS info.
 *
 * @param userAgent - Raw User-Agent header string
 * @returns Structured device information
 */
export function parseUserAgent(userAgent: string): ParsedDevice {
  const parser = new UAParser(userAgent);
  const result = parser.getResult();

  const browser = [result.browser.name, result.browser.version]
    .filter(Boolean)
    .join(" ") || "Unknown Browser";

  const os = [result.os.name, result.os.version]
    .filter(Boolean)
    .join(" ") || "Unknown OS";

  const deviceType = result.device.type;
  const deviceVendor = result.device.vendor;
  const deviceModel = result.device.model;

  let deviceName = "Desktop";
  if (deviceType === "mobile") {
    deviceName = [deviceVendor, deviceModel].filter(Boolean).join(" ") || "Mobile Device";
  } else if (deviceType === "tablet") {
    deviceName = [deviceVendor, deviceModel].filter(Boolean).join(" ") || "Tablet";
  } else if (deviceType === "smarttv") {
    deviceName = "Smart TV";
  }

  return { deviceName, browser, os };
}

/**
 * Returns the device type icon name based on device name.
 * Used for UI rendering.
 *
 * @param deviceName - Parsed device name
 * @returns "mobile" | "tablet" | "desktop"
 */
export function getDeviceType(
  deviceName: string
): "mobile" | "tablet" | "desktop" {
  const lower = deviceName.toLowerCase();
  if (lower.includes("mobile") || lower.includes("phone")) return "mobile";
  if (lower.includes("tablet") || lower.includes("ipad")) return "tablet";
  return "desktop";
}
