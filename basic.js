function sanitizeLog(entry, disallowedCharacters) {
  let result = "";

  for (const char of entry) {
    result += disallowedCharacters.includes(char) ? "#" : char;
  }

  return result;
}

function cleanLogs(logs, disallowedCharacters) {
  let sanitizedCount = 0;
  let informationalCount = 0;

  for (const entry of logs) {
    // Fatal marker check comes first, so it applies to every entry
    if (entry.includes("$")) {
      return "Sanitizing stopped. Failure Reason: Fatal character occurred.";
    }

    if (entry.startsWith("/")) {
      informationalCount++;
    } else {
      sanitizeLog(entry, disallowedCharacters);
      sanitizedCount++;
    }
  }

  return `Total Entry Count: ${logs.length}. Sanitized Entry Count: ${sanitizedCount}. Informational Entry Count: ${informationalCount}. Finished sanitizing logs.`;
}
