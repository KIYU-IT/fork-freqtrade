# Freqtrade 상세 사용 가이드 (한국어)

이 문서는 Freqtrade를 처음 사용하는 사용자를 위한 상세 가이드입니다.

## 목차
1. [Freqtrade란?](#1-freqtrade란)
2. [설치 방법](#2-설치-방법)
3. [기본 설정](#3-기본-설정)
4. [전략 개발](#4-전략-개발)
5. [백테스팅](#5-백테스팅)
6. [실전 거래](#6-실전-거래)
7. [모니터링](#7-모니터링)
8. [고급 기능](#8-고급-기능)
9. [문제 해결](#9-문제-해결)

## 1. Freqtrade란?

Freqtrade는 Python으로 작성된 오픈소스 암호화폐 자동 트레이딩 봇입니다.

### 주요 특징
- **다양한 거래소 지원**: Binance, Bybit, OKX, Kraken 등
- **백테스팅**: 과거 데이터로 전략 검증
- **전략 최적화**: Hyperopt를 통한 파라미터 최적화
- **AI/ML 통합**: FreqAI를 통한 머신러닝 트레이딩
- **실시간 모니터링**: WebUI, Telegram 봇 지원
- **리스크 관리**: 스탑로스, 트레일링 스탑, ROI 설정

## 2. 설치 방법

### 2.1 Docker를 사용한 설치 (권장)

```bash
# 1. 프로젝트 디렉토리 생성
mkdir my-freqtrade-bot
cd my-freqtrade-bot

# 2. docker-compose.yml 다운로드
curl https://raw.githubusercontent.com/freqtrade/freqtrade/stable/docker-compose.yml -o docker-compose.yml

# 3. Freqtrade 이미지 다운로드
docker compose pull

# 4. 사용자 디렉토리 구조 생성
docker compose run --rm freqtrade create-userdir --userdir user_data

# 5. 설정 파일 생성 (대화형)
docker compose run --rm freqtrade new-config --config user_data/config.json
```

### 2.2 Native 설치 (Python)

```bash
# 1. Python 가상환경 생성
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate

# 2. Freqtrade 설치
pip install freqtrade

# 3. 사용자 디렉토리 생성
freqtrade create-userdir --userdir user_data

# 4. 설정 파일 생성
freqtrade new-config --config user_data/config.json
```

## 3. 기본 설정

### 3.1 설정 파일 구조 (config.json)

```json
{
    "$schema": "https://schema.freqtrade.io/schema.json",
    
    // 거래 설정
    "max_open_trades": 3,               // 동시 오픈 가능한 최대 거래 수
    "stake_currency": "USDT",           // 기본 통화
    "stake_amount": 100,                // 거래당 금액
    "tradable_balance_ratio": 0.99,     // 사용 가능한 잔고 비율
    "dry_run": true,                    // 모의 거래 모드
    "dry_run_wallet": 10000,            // 모의 거래 시작 금액
    
    // 시간 설정
    "timeframe": "5m",                  // 캔들 시간 단위
    "trailing_stop": false,             // 트레일링 스탑 사용 여부
    "trailing_stop_positive": 0.005,    // 트레일링 스탑 시작 수익률
    "trailing_stop_positive_offset": 0.0051,
    "trailing_only_offset_is_reached": false,
    
    // 거래소 설정
    "exchange": {
        "name": "bybit",
        "key": "your-api-key",
        "secret": "your-api-secret",
        "ccxt_config": {
            "enableRateLimit": true
        },
        "ccxt_async_config": {
            "enableRateLimit": true,
            "rateLimit": 200
        },
        "pair_whitelist": [
            "BTC/USDT",
            "ETH/USDT",
            "BNB/USDT"
        ],
        "pair_blacklist": []
    },
    
    // 전략 설정
    "strategy": "SampleStrategy",
    "strategy_path": "user_data/strategies/",
    
    // API 서버 설정
    "api_server": {
        "enabled": true,
        "listen_ip_address": "127.0.0.1",
        "listen_port": 8080,
        "verbosity": "error",
        "enable_openapi": false,
        "jwt_secret_key": "somethingrandom",
        "CORS_origins": [],
        "username": "freqtrader",
        "password": "SuperSecurePassword"
    },
    
    // Telegram 설정
    "telegram": {
        "enabled": false,
        "token": "your-telegram-token",
        "chat_id": "your-chat-id"
    }
}
```

### 3.2 거래소 API 키 생성

#### Bybit 예시
1. Bybit 로그인 → API 관리
2. 새 API 키 생성
3. 권한 설정:
   - 읽기 권한: 활성화
   - 거래 권한: 활성화 (실거래 시)
   - 출금 권한: 비활성화 (보안상 권장)
4. IP 제한 설정 (선택사항)

## 4. 전략 개발

### 4.1 기본 전략 구조

```python
# user_data/strategies/my_strategy.py
from freqtrade.strategy import IStrategy, Trade
from pandas import DataFrame
import talib.abstract as ta

class MyStrategy(IStrategy):
    """
    간단한 RSI 기반 전략 예시
    """
    # 전략 버전
    INTERFACE_VERSION = 3
    
    # 시간 프레임
    timeframe = '5m'
    
    # ROI 테이블
    minimal_roi = {
        "0": 0.10,      # 즉시 10% 수익 시 매도
        "10": 0.05,     # 10분 후 5% 수익 시 매도
        "30": 0.01,     # 30분 후 1% 수익 시 매도
        "60": 0          # 60분 후 손익분기점에서 매도
    }
    
    # 스탑로스
    stoploss = -0.10  # -10%
    
    # 트레일링 스탑
    trailing_stop = True
    trailing_stop_positive = 0.01
    trailing_stop_positive_offset = 0.02
    
    def populate_indicators(self, dataframe: DataFrame, metadata: dict) -> DataFrame:
        """
        기술적 지표 계산
        """
        # RSI
        dataframe['rsi'] = ta.RSI(dataframe, timeperiod=14)
        
        # MACD
        macd = ta.MACD(dataframe)
        dataframe['macd'] = macd['macd']
        dataframe['macdsignal'] = macd['macdsignal']
        dataframe['macdhist'] = macd['macdhist']
        
        # 볼린저 밴드
        bollinger = ta.BBANDS(dataframe, timeperiod=20)
        dataframe['bb_upper'] = bollinger['upperband']
        dataframe['bb_middle'] = bollinger['middleband']
        dataframe['bb_lower'] = bollinger['lowerband']
        
        # EMA
        dataframe['ema20'] = ta.EMA(dataframe, timeperiod=20)
        dataframe['ema50'] = ta.EMA(dataframe, timeperiod=50)
        
        return dataframe
    
    def populate_entry_trend(self, dataframe: DataFrame, metadata: dict) -> DataFrame:
        """
        매수 신호 생성
        """
        dataframe.loc[
            (
                (dataframe['rsi'] < 30) &  # RSI 과매도
                (dataframe['close'] < dataframe['bb_lower']) &  # 볼린저 밴드 하단 돌파
                (dataframe['ema20'] > dataframe['ema50']) &  # 상승 추세
                (dataframe['volume'] > 0)  # 거래량 있음
            ),
            'enter_long'] = 1
        
        return dataframe
    
    def populate_exit_trend(self, dataframe: DataFrame, metadata: dict) -> DataFrame:
        """
        매도 신호 생성
        """
        dataframe.loc[
            (
                (dataframe['rsi'] > 70) |  # RSI 과매수
                (dataframe['close'] > dataframe['bb_upper'])  # 볼린저 밴드 상단 돌파
            ),
            'exit_long'] = 1
        
        return dataframe
```

### 4.2 고급 전략 기능

```python
class AdvancedStrategy(IStrategy):
    # 하이퍼파라미터 최적화를 위한 파라미터 정의
    buy_rsi = IntParameter(20, 40, default=30, space='buy')
    sell_rsi = IntParameter(60, 80, default=70, space='sell')
    
    def custom_exit(self, pair: str, trade: Trade, current_time: datetime,
                   current_rate: float, current_profit: float, **kwargs) -> Optional[Union[str, bool]]:
        """
        커스텀 종료 로직
        """
        # 20% 이상 수익 시 즉시 매도
        if current_profit > 0.20:
            return 'take_profit_20'
        
        # 5% 손실이고 1시간 이상 보유 시 손절
        if current_profit < -0.05 and (current_time - trade.open_date_utc).seconds > 3600:
            return 'stop_loss_time'
        
        return False
    
    def custom_stake_amount(self, pair: str, current_time: datetime,
                           current_rate: float, proposed_stake: float,
                           min_stake: float, max_stake: float, **kwargs) -> float:
        """
        동적 포지션 크기 조정
        """
        # 변동성에 따라 포지션 크기 조정
        if self.dp.runmode.value in ('live', 'dry_run'):
            # 실제 거래 시에만 적용
            return proposed_stake * 0.5  # 50% 크기로 거래
        return proposed_stake
```

## 5. 백테스팅

### 5.1 과거 데이터 다운로드

```bash
# Docker 사용 시
docker compose run --rm freqtrade download-data \
    --exchange bybit \
    --pairs BTC/USDT ETH/USDT BNB/USDT \
    --timeframe 5m 15m 1h \
    --days 60

# Native 설치 시
freqtrade download-data \
    --exchange bybit \
    --pairs BTC/USDT ETH/USDT \
    --timeframe 5m \
    --timerange 20240101-20240301
```

### 5.2 백테스팅 실행

```bash
# 기본 백테스팅
docker compose run --rm freqtrade backtesting \
    --config user_data/config.json \
    --strategy MyStrategy \
    --timeframe 5m

# 상세 백테스팅
docker compose run --rm freqtrade backtesting \
    --config user_data/config.json \
    --strategy MyStrategy \
    --timeframe 5m \
    --timerange 20240101-20240301 \
    --export trades \
    --export-filename user_data/backtest_results/backtest-result.json
```

### 5.3 백테스팅 결과 분석

```bash
# 백테스팅 결과 보기
docker compose run --rm freqtrade backtesting-show \
    --config user_data/config.json

# 백테스팅 분석 리포트 생성
docker compose run --rm freqtrade backtesting-analysis \
    --config user_data/config.json \
    --analysis-groups 0 1 2 3 4
```

## 6. 실전 거래

### 6.1 모의 거래 (Dry Run)

```bash
# Docker Compose로 실행
docker compose up -d

# 로그 확인
docker compose logs -f

# 상태 확인
docker compose ps
```

### 6.2 실거래 전환

1. config.json 수정:
```json
{
    "dry_run": false,  // false로 변경
    "exchange": {
        "key": "실제-API-키",
        "secret": "실제-API-시크릿"
    }
}
```

2. 안전 점검사항:
- [ ] 소액으로 시작
- [ ] 스탑로스 설정 확인
- [ ] API 키 권한 확인 (출금 권한 없음)
- [ ] 전략 백테스팅 완료
- [ ] 모의 거래에서 충분한 테스트

### 6.3 봇 관리 명령어

```bash
# 봇 중지
docker compose stop

# 봇 재시작
docker compose restart

# 설정 리로드
docker compose run --rm freqtrade reload-config

# 현재 거래 상태 확인
docker compose run --rm freqtrade show-trades
```

## 7. 모니터링

### 7.1 WebUI 사용

1. 브라우저에서 http://localhost:8080 접속
2. 로그인 정보 입력 (config.json의 username/password)
3. 주요 기능:
   - 대시보드: 수익률, 잔고, 활성 거래
   - 거래 내역: 완료된 거래 목록
   - 차트: 기술적 분석 차트
   - 설정: 봇 설정 변경

### 7.2 Telegram 봇 설정

1. BotFather에서 봇 생성
2. 토큰 받기
3. config.json에 설정 추가:

```json
"telegram": {
    "enabled": true,
    "token": "your-bot-token",
    "chat_id": "your-chat-id",
    "notification_settings": {
        "status": "on",
        "warning": "on",
        "startup": "on",
        "entry": "on",
        "exit": {
            "roi": "on",
            "emergency_exit": "on",
            "force_exit": "on",
            "exit_signal": "on",
            "trailing_stop_loss": "on",
            "stop_loss": "on",
            "stoploss_on_exchange": "on",
            "custom_exit": "on"
        },
        "entry_cancel": "on",
        "exit_cancel": "on",
        "entry_fill": "on",
        "exit_fill": "on"
    }
}
```

### 7.3 로그 분석

```bash
# 실시간 로그 보기
tail -f user_data/logs/freqtrade.log

# 에러 로그만 보기
grep ERROR user_data/logs/freqtrade.log

# 특정 날짜 로그 보기
grep "2024-03-01" user_data/logs/freqtrade.log
```

## 8. 고급 기능

### 8.1 Hyperopt (전략 최적화)

```bash
# 하이퍼파라미터 최적화 실행
docker compose run --rm freqtrade hyperopt \
    --config user_data/config.json \
    --strategy MyStrategy \
    --hyperopt-loss SharpeHyperOptLoss \
    --epochs 1000 \
    --spaces buy sell roi stoploss \
    --jobs 4

# 최적화 결과 보기
docker compose run --rm freqtrade hyperopt-list \
    --config user_data/config.json \
    --best
```

### 8.2 FreqAI (머신러닝 트레이딩)

```python
# FreqAI 전략 예시
class FreqAIStrategy(IStrategy):
    # FreqAI 설정
    freqai = {
        "enabled": true,
        "purge_old_models": true,
        "train_period_days": 30,
        "backtest_period_days": 7,
        "identifier": "my_model",
        "feature_parameters": {
            "include_timeframes": ["5m", "15m", "1h"],
            "include_corr_pairlist": ["BTC/USDT", "ETH/USDT"],
            "label_period_candles": 24,
            "include_shifted_candles": 2,
            "DI_threshold": 0.9,
            "weight_factor": 0.9,
            "principal_component_analysis": false,
            "use_SVM_to_remove_outliers": true,
            "svm_params": {"shuffle": false, "nu": 0.01}
        },
        "data_split_parameters": {
            "test_size": 0.33,
            "random_state": 1
        },
        "model_training_parameters": {
            "n_estimators": 100,
            "random_state": 1,
            "learning_rate": 0.02,
            "task_type": "CPU"
        }
    }
```

### 8.3 Edge Positioning

```json
// config.json에 Edge 설정 추가
"edge": {
    "enabled": true,
    "process_throttle_secs": 3600,
    "calculate_since_number_of_days": 14,
    "allowed_risk": 0.01,
    "stoploss_range_min": -0.01,
    "stoploss_range_max": -0.1,
    "stoploss_range_step": -0.01,
    "minimum_winrate": 0.60,
    "minimum_expectancy": 0.10,
    "min_trade_number": 10,
    "max_trade_duration_minute": 1440,
    "remove_pumps": false
}
```

## 9. 문제 해결

### 9.1 일반적인 문제

#### API 키 오류
```
"Invalid API Key"
```
해결책:
- API 키와 시크릿 확인
- IP 화이트리스트 확인
- API 권한 확인

#### 잔고 부족
```
"Insufficient balance"
```
해결책:
- stake_amount 줄이기
- tradable_balance_ratio 조정
- 거래소 잔고 확인

#### 데이터 다운로드 실패
```
"Could not fetch historical data"
```
해결책:
- 인터넷 연결 확인
- 거래소 API 상태 확인
- timerange 조정

### 9.2 성능 최적화

1. **데이터베이스 최적화**
```bash
# SQLite vacuum
sqlite3 user_data/tradesv3.sqlite "VACUUM;"
```

2. **메모리 사용량 줄이기**
```json
"pairlists": [{
    "method": "VolumePairList",
    "number_assets": 20,  // 페어 수 제한
    "sort_key": "quoteVolume"
}]
```

3. **백테스팅 속도 향상**
```bash
# 멀티프로세싱 사용
docker compose run --rm freqtrade backtesting \
    --strategy MyStrategy \
    --timeframe 5m \
    --enable-position-stacking \
    --max-open-trades 10
```

### 9.3 보안 주의사항

1. **API 키 보안**
   - 절대 API 키를 공유하지 마세요
   - 출금 권한은 비활성화
   - IP 화이트리스트 사용

2. **설정 파일 보안**
   - config.json을 git에 커밋하지 마세요
   - 환경 변수 사용 고려

3. **웹 인터페이스 보안**
   - 강력한 비밀번호 사용
   - localhost에서만 접근 가능하도록 설정
   - VPN 사용 권장

## 추가 리소스

- [공식 문서](https://www.freqtrade.io)
- [GitHub 저장소](https://github.com/freqtrade/freqtrade)
- [Discord 커뮤니티](https://discord.gg/p7nuUNVfP7)
- [전략 예시](https://github.com/freqtrade/freqtrade-strategies)

## 마무리

Freqtrade는 강력한 기능을 제공하지만, 실제 거래에서는 항상 주의가 필요합니다. 충분한 백테스팅과 모의 거래를 거친 후 실거래를 시작하세요. 절대 감당할 수 없는 금액으로 거래하지 마세요.

질문이나 도움이 필요하면 공식 문서와 커뮤니티를 활용하세요.

---

작성자: KIYU-IT
최종 수정일: 2025-01-10