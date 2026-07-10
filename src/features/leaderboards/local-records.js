export function createLocalRecords(records) {
  const metadata = (value, context) => ({ value, at: new Date().toISOString(), contentVersion: context.contentVersion, seedVersion: context.seedVersion, seed: context.seed });
  return {
    highscore(value, context) { if (!records.highscore || value > records.highscore.value) records.highscore = metadata(value, context); },
    campaignTime(value, context) { if (!records.campaignTime || value < records.campaignTime.value) records.campaignTime = metadata(value, context); },
    abyssDepth(value, context) { if (!records.abyssDepth || value > records.abyssDepth.value) records.abyssDepth = metadata(value, context); },
    daily(date, value, context) { if (!records.daily[date] || value > records.daily[date].value) records.daily[date] = metadata(value, context); },
    bossRush(value, context) { if (!records.bossRush || value < records.bossRush.value) records.bossRush = metadata(value, context); }
  };
}
