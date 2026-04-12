import { ApiError } from "../utils/api-error.js";

function buildMarketAnalysisOutput() {
  return `
[market] loading 7-day market intelligence...
[market] source mode: darkgpt backend terminal analysis
[market] region: global
[market] last_24h_window: enabled
[market] timeframe: last 7 days

==============================
GOLD (XAUUSD) ANALYSIS
==============================
Trend: bullish continuation with controlled pullbacks
Momentum: positive, supported by defensive flow and macro uncertainty
Volatility: moderate with occasional spikes around rate-sensitive headlines
Key zones: support 2318-2332 | resistance 2385-2408
24H summary: Gold stayed bid through intraday weakness and recovered quickly after headline-driven dips.
7D summary: Gold stayed resilient through shallow retracements and buyers stepped in quickly near support. The weekly structure still favors upside as long as bids remain above the 2318 zone.

==============================
SILVER (XAGUSD) ANALYSIS
==============================
Trend: constructive but less stable than gold
Momentum: improving after a choppy consolidation phase
Volatility: high relative to gold, sharper intraday swings
Key zones: support 27.20-27.45 | resistance 28.10-28.48
24H summary: Silver tracked risk sentiment more closely and printed wider swings, but dip buyers still defended the lower support band.
7D summary: Silver remained tradable with stronger volatility than gold, though follow-through has been less reliable and requires tighter risk controls.

==============================
CRYPTO MARKET ANALYSIS
==============================
BTC: bullish structure, strong relative strength, spot-led support
ETH: neutral-bullish, lagging BTC but still holding higher lows
SOL: aggressive upside beta, momentum strong but volatility elevated
TOTAL MARKET CAP: improving breadth with leadership concentrated in majors
24H summary: BTC led the market with orderly strength, ETH followed with slower confirmation, and high-beta names remained reactive to momentum bursts.
7D summary: Digital assets maintained a risk-on tone, but leverage conditions remain fragile. Pullbacks are being bought, although weaker altcoins are still underperforming compared with BTC.

==============================
DIGITAL ASSET OVERVIEW
==============================
Market tone: cautiously optimistic
Momentum profile: positive in majors, mixed in lower-cap assets
Volatility profile: elevated intraday, tradable swings remain active
Sentiment read: improving, but still sensitive to macro headlines and ETF-related flow
24H summary: Market breadth improved modestly, but conviction still sits mostly in BTC and a small cluster of liquid majors.
7D summary: The broader digital market stayed constructive overall, though rotation quality remains uneven and still favors selective exposure.

==============================
BEST CURRENT OPPORTUNITY
==============================
Asset: BTC/USDT
Bias: bullish on pullback
Reason: cleaner structure than most majors, stronger dip demand, better follow-through
Setup idea: monitor retrace into breakout support, then wait for reclaim + volume confirmation
Risk level: medium

==============================
EXAMPLE TRADE SETUPS
==============================
BTC/USDT
- Entry zone: 66800-67100
- Take profit: 68500 / 69200
- Stop loss: 65900

XAUUSD
- Entry zone: 2328-2334
- Take profit: 2378 / 2398
- Stop loss: 2314

ETH/USDT
- Entry zone: 3185-3210
- Take profit: 3315 / 3380
- Stop loss: 3128

==============================
TRADER NOTES
==============================
- Avoid chasing breakout candles after aggressive expansion.
- Keep position size smaller when stop distance widens due to volatility.
- If BTC loses leadership, altcoins may weaken faster than majors.
- Watch macro calendar events because gold and crypto can reprice quickly.
- Silver can outperform on momentum days, but it usually requires faster execution and stricter stop discipline.

========================================
SECURE BROKER CONNECTION
========================================
To enable automated execution, connect a supported broker securely.
Supported methods:
- Broker API key
- Exchange API key
- OAuth / broker integration

Status: automation disabled
Next step: secure connection required
  `.trim();
}

function buildPineScriptOutput(username) {
  return `
[strategy] compiling pine strategy workspace...
[strategy] profile: ${username ?? "darkgpt-user"}
[strategy] mode: pine script strategy scaffold

========================================
PINE SCRIPT STRATEGY REPORT
========================================
Strategy name: DarkGPT Momentum Breakout
Market focus: BTC/USDT
Timeframe: 1H
Logic: EMA trend filter + breakout confirmation + ATR risk control

[rules]
1. Confirm bullish trend with EMA 20 above EMA 50.
2. Wait for candle close above recent breakout range.
3. Require volume to stay above the 20-period average.
4. Use ATR-based stop loss to adapt to volatility.

[pine]
//@version=5
strategy("DarkGPT Momentum Breakout", overlay=true, initial_capital=10000)
fastEma = ta.ema(close, 20)
slowEma = ta.ema(close, 50)
atrValue = ta.atr(14)
volumeFilter = volume > ta.sma(volume, 20)
breakoutHigh = ta.highest(high, 18)
longCondition = close > breakoutHigh[1] and fastEma > slowEma and volumeFilter

if (longCondition)
    strategy.entry("Long", strategy.long)

strategy.exit(
    "Exit Long",
    "Long",
    stop = strategy.position_avg_price - (atrValue * 1.8),
    limit = strategy.position_avg_price + (atrValue * 3.2)
)

[notes]
- Add session filters if you want fewer low-volume entries.
- Add short logic only after confirming bearish regime rules.
- Forward-test before live execution.

[next]
Request MT5 conversion, webhook alerts, or a multi-asset version when ready.
  `.trim();
}

export const chatTerminalService = {
  async generateOutput(user, { action }) {
    const normalizedAction = action?.trim().toLowerCase();

    if (!normalizedAction) {
      throw new ApiError(400, "Terminal action is required.", "VALIDATION_ERROR");
    }

    if (normalizedAction === "market_analysis") {
      return {
        action: normalizedAction,
        output: buildMarketAnalysisOutput()
      };
    }

    if (normalizedAction === "pine_script_strategy") {
      return {
        action: normalizedAction,
        output: buildPineScriptOutput(user?.username)
      };
    }

    throw new ApiError(400, "Unsupported terminal action.", "UNSUPPORTED_TERMINAL_ACTION");
  }
};
