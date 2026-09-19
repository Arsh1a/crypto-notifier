/** Poll interval, matching the original 20s tick. */
export const POLL_MS = 20_000;

/** Snapshots compared head to tail: (5 - 1) x 20s = an 80s lookback. */
export const CALCULATE_AFTER = 5;

/** A coin at or above this ratio bumps its counter and turns its card red. */
export const THRESHOLD_FOR_COUNT = 1.004;

/** Every counter goes back to zero on this interval. */
export const COUNTS_RESET_MS = 900_000;

/** Default alert ratio, shown in the navbar field. 1.05 is a 5% move. */
export const DEFAULT_ALERT_AT = 1.05;

/**
 * The coins the original watched, merged from its five request lists and
 * de-duplicated. The feed is filtered to these, so the board stays the same
 * set of names it always was.
 */
export const SELECTED_CURRENCIES = new Set([
  "1INCH", "AAVE", "ADA", "AEVO", "AGLD", "AIXBT", "AKRO", "ALGO",
  "ALICE", "ALPHA", "ANKR", "ANRR", "ANT", "APE", "API3", "APT",
  "AR", "ARB", "ARDR", "ARPA", "ATA", "ATH", "ATM", "ATOM",
  "AUDIO", "AUTO", "AVA", "AVAX", "AVE", "AXS", "BABYDOGE", "BADGER",
  "BAL", "BANANA", "BAND", "BANK", "BAR", "BAT", "BCH", "BEAN",
  "BEL", "BICO", "BLUR", "BLZ", "BNB", "BNX", "BOME", "BTC",
  "BTT", "BURGER", "BZRX", "CAKE", "CAT", "CATI", "CELO", "CELR",
  "CFX", "CGPT", "CHZ", "COCOS", "COMP", "COOKIE", "COS", "CRV",
  "CTK", "CTSI", "CTXC", "CVC", "CVX", "DAI", "DAO", "DATA",
  "DCR", "DEGO", "DEXE", "DGB", "DIA", "DNT", "DODO", "DOGE",
  "DOGS", "DOT", "DREP", "DUSK", "DYDX", "EDU", "EGALA", "EGLD",
  "EIGEN", "ENA", "ENJ", "ENS", "EOS", "EPS", "ETC", "ETH",
  "ETHFI", "FET", "FIL", "FIO", "FIRO", "FIS", "FLOKI", "FLOW",
  "FLR", "FORM", "FORTH", "FTM", "FTT", "G", "GLM", "GMT",
  "GMX", "GRAPH", "GRT", "GTC", "GTO", "GXS", "HARD", "HBAR",
  "HIVE", "HMSTR", "HOT", "ICP", "IMX", "INJ", "IO", "IOTA",
  "IOTX", "IRIS", "JASMY", "JST", "JTO", "JUP", "JUV", "KAITO",
  "KEEP", "KEY", "KLAY", "KNC", "KSM", "LAYER", "LDO", "LINA",
  "LINK", "LIT", "LPT", "LRC", "LSK", "LTC", "LUNA", "MAGIC",
  "MAJOR", "MANA", "MASK", "MATIC", "MBL", "MDT", "MEME", "METIS",
  "MFT", "MKR", "MORPHO", "MOVE", "MTL", "NBS", "NEAR", "NEIRO",
  "NEO", "NET", "NKN", "NMR", "NOT", "NU", "NULS", "OCEN",
  "OG", "OGN", "OM", "OMG", "ONDO", "ONE", "ONG", "ONT",
  "ORCA", "ORN", "PAX", "PAXG", "PENDLE", "PENGU", "PEPE", "PERF",
  "PERL", "PERP", "PHA", "PMN", "PNT", "PNUT", "POL", "POLS",
  "POND", "PSG", "PUNDIX", "PYTH", "QNT", "QTUM", "RAMP", "RAY",
  "RDNT", "REEF", "REN", "RENDER", "RIF", "RLC", "ROSE", "RSR",
  "RUNE", "RVN", "S", "SAFE", "SAHARA", "SAND", "SC", "SFP",
  "SHIB", "SKL", "SLP", "SNT", "SNX", "SOL", "SRM", "SSV",
  "STMX", "STORJ", "STPT", "STRK", "STX", "SUN", "SUPER", "SUSHI",
  "SXP", "SYRUP", "T", "TCT", "THETA", "TKO", "TLM", "TNSR",
  "TOMO", "TON", "TORN", "TRB", "TROY", "TRU", "TRX", "TURBO",
  "TWT", "UMA", "UNFI", "UNI", "UNO", "UTK", "VET", "VIRTUAL",
  "W", "WAN", "WAVES", "WBTC", "WIF", "WIN", "WING", "WLD",
  "WNXM", "WOO", "WRX", "WTC", "X", "XAUT", "XEM", "XLM",
  "XMR", "XRP", "XTZ", "XVS", "YFI", "ZEC", "ZEN", "ZIL",
  "ZRO", "ZRX",
]);
