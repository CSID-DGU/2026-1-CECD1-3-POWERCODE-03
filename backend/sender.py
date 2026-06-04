import csv
import json
import os
import time
import urllib.request
import urllib.error
from datetime import datetime

# ANSI Color Codes
GREEN = "\033[92m"
YELLOW = "\033[93m"
RED = "\033[91m"
BLUE = "\033[94m"
CYAN = "\033[96m"
RESET = "\033[0m"
BOLD = "\033[1m"

CSV_FILEPATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "mock_logs.csv")
BACKEND_URL = "http://localhost:5001/api/anomaly/logs"

MOCK_CSV_DATA = [
    ["processName", "channelName", "transactionId", "responseCode", "anomalyScore", "processTimeMs", "summary", "suspectedCause", "recommendedAction"],
    [
        "IF_DB2DB_9xx_DELETE_PR001",
        "SOL",
        "TR-IF_DB2DB_9xx_DELETE-20251224102531591-1",
        "4104",
        "0.96",
        "519700",
        "DB.DELETE 프로세스에서 테이블 메타데이터 조회 실패가 반복되어 해당 프로세스가 장시간 실패 상태로 종료됨",
        "삭제 대상 테이블의 컬럼 메타데이터를 조회하지 못해 DB.DELETER 단계가 실패한 케이스입니다.",
        "테이블 스키마 또는 DB 계정의 메타데이터 조회 권한을 점검하십시오."
    ],
    [
        "IF_HTTP_GATEWAY_IN_PR002",
        "OPENAPI",
        "TR-GATEWAY-20251224102532456-2",
        "4001",
        "0.82",
        "125000",
        "HTTP 인바운드 게이트웨이에서 타임아웃 발생으로 클라이언트 연결 차단",
        "백엔드 인터페이스 서버의 부하 급증으로 인해 HTTP 핸들러가 지정 시간 내에 응답을 주지 못했습니다.",
        "인터페이스 서버 커넥션 풀 크기 확장 및 라우터 서버의 타임아웃 설정을 튜닝하십시오."
    ],
    [
        "IF_SAP_RFC_ADAPTER_PR003",
        "SAP",
        "TR-SAPRFC-20251224102533789-3",
        "4005",
        "0.74",
        "30500",
        "SAP RFC 커넥션 획득에 실패하여 어댑터 호출 에러 및 트랜잭션 롤백 처리",
        "SAP 데스티네이션 게이트웨이의 가용 포트가 고갈되었거나 최대 커넥션 제한에 도달했습니다.",
        "SAP NetWeaver 리소스 모니터 및 RFC 데스티네이션 커넥션 개수를 증설하십시오."
    ],
    [
        "IF_DB2FILE_EXPORT_PR004",
        "EAI",
        "TR-EXPORT-20251224102534123-4",
        "0000",
        "0.15",
        "1200",
        "정상 가동: DB 레코드 파일 내보내기 프로세스 완료",
        "정상 작동 중인 트랜잭션입니다.",
        "조치 필요 없음."
    ],
    [
        "IF_REST_AUTH_API_PR005",
        "APP",
        "TR-RESTAUTH-20251224102535987-5",
        "4102",
        "0.91",
        "284000",
        "사용자 인증 토큰 검증 단계에서 세션 클러스터 레디스 접근 실패로 세션 불일치 에러 발생",
        "인증 서버가 연동하는 Redis 세션 캐시 노드 간의 클러스터 동기화 지연 또는 네트워크 단절이 의심됩니다.",
        "레디스 메모리 가용량 확보 및 클러스터 헬스 체크 상태를 리포트하십시오."
    ],
    [
        "IF_KAFKA_PRODUCER_PR006",
        "EVENT",
        "TR-KAFKAPROD-20251224102536321-6",
        "0000",
        "0.08",
        "450",
        "정상 가동: 카프카 클러스터에 원격 분석 이벤트 발행 완료",
        "정상 작동 중인 트랜잭션입니다.",
        "조치 필요 없음."
    ],
    [
        "IF_BATCH_SYNC_PR007",
        "BATCH",
        "TR-BATCHSYNC-20251224102537654-7",
        "4106",
        "0.88",
        "185000",
        "배치 동기화 트랜잭션 처리 중 타겟 데이터베이스 세션 락(Session Lock) 점유로 전체 파이프라인 블로킹",
        "배치 업데이트 쿼리가 장시간 실행되면서 타겟 테이블의 레코드 락을 해제하지 않아 후속 트랜잭션이 대기 상태로 누적되었습니다.",
        "데이터베이스 세션 락 상황 모니터링 후 데드락 상태의 세션을 킬(Kill) 조치하고 트랜잭션 주기를 재조정하십시오."
    ],
    [
        "IF_SMTP_SENDER_PR008",
        "MAIL",
        "TR-SMTPSEND-20251224102538987-8",
        "4003",
        "0.68",
        "15200",
        "SMTP 메일 발송 제한량 초과로 외부 발신 데몬 비정상 종료",
        "메일 중계 서버(Relay)의 일일 메일 발송 한도를 초과하여 발송 요청이 거부되었습니다.",
        "화이트 리스트 IP 대역의 릴레이 허용량을 체크하고 발송 대기 큐를 분산 처리하십시오."
    ],
    [
        "IF_FILE_TRANSFER_PR009",
        "FTP",
        "TR-FILETRANS-20251224102539012-9",
        "0000",
        "0.05",
        "890",
        "정상 가동: 배치 파일 전송 완료",
        "정상 작동 중인 트랜잭션입니다.",
        "조치 필요 없음."
    ],
    [
        "IF_PAYMENT_PAY_PR010",
        "MOBILE",
        "TR-PAYMENT-20251224102540111-10",
        "4105",
        "0.99",
        "320000",
        "결제 승인 프로세스 지연 중 게이트웨이 커넥션 타임아웃 오류 및 데이터 유실 위험 감지",
        "PG(결제대행사) 연동 구간의 해외 망 장애 또는 외부 PG사 시스템의 장애로 인해 커넥션이 정상 종료되지 못했습니다.",
        "PG사 헬스 가용성을 체크하고 대체 PG 라우팅 경로 활성화 여부를 결정하십시오."
    ]
]

def generate_mock_csv():
    """가정용 이상 탐지 완료 데이터 CSV 파일을 생성합니다."""
    if not os.path.exists(CSV_FILEPATH):
        print(f"{CYAN}[CSV Creation]{RESET} Generating mock CSV dataset at: {BOLD}{CSV_FILEPATH}{RESET}")
        with open(CSV_FILEPATH, mode="w", encoding="utf-8", newline="") as f:
            writer = csv.writer(f)
            writer.writerows(MOCK_CSV_DATA)
        print(f"{GREEN}[SUCCESS]{RESET} Mock CSV generated successfully with {len(MOCK_CSV_DATA) - 1} cases.")
    else:
        print(f"{BLUE}[INFO]{RESET} Existing CSV file found at {CSV_FILEPATH}. Skipping creation.")

def send_log_to_server(log_data):
    """HTTP POST를 통해 Express 서버로 이상 로그를 전달합니다. (urllib 표준라이브러리 활용)"""
    data = json.dumps(log_data).encode("utf-8")
    req = urllib.request.Request(
        BACKEND_URL,
        data=data,
        headers={"Content-Type": "application/json"}
    )
    try:
        with urllib.request.urlopen(req) as res:
            response_data = json.loads(res.read().decode("utf-8"))
            return res.status, response_data
    except urllib.error.HTTPError as e:
        response_body = e.read().decode("utf-8")
        try:
            err_json = json.loads(response_body)
            return e.code, err_json
        except Exception:
            return e.code, {"message": response_body}
    except urllib.error.URLError as e:
        return 0, {"message": str(e.reason)}

def main():
    print(f"{BOLD}{BLUE}================================================================{RESET}")
    print(f"{BOLD}{BLUE}    ESB Transaction Log Anomaly Real-Time Sender (Prototype)   {RESET}")
    print(f"{BOLD}{BLUE}================================================================{RESET}")
    
    generate_mock_csv()
    
    print(f"\n{BLUE}[INFO]{RESET} Reading CSV and sending logs to {BOLD}{BACKEND_URL}{RESET} at a rate of {BOLD}1 log/sec{RESET}...")
    
    with open(CSV_FILEPATH, mode="r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        rows = list(reader)
    
    total_logs = len(rows)
    print(f"{BLUE}[INFO]{RESET} Ready to send total {BOLD}{total_logs}{RESET} log records.")
    
    time.sleep(1.5)
    
    sent_count = 0
    for i, row in enumerate(rows):
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S.%f")[:-3]
        log_payload = {
            "logId": f"anomaly-realtime-{1000 + i}",
            "detectedAt": timestamp,
            "processName": row["processName"],
            "channelName": row["channelName"],
            "transactionId": row["transactionId"],
            "responseCode": row["responseCode"],
            "anomalyScore": float(row["anomalyScore"]),
            "processTimeMs": int(row["processTimeMs"]),
            "summary": row["summary"],
            "suspectedCause": row["suspectedCause"],
            "recommendedAction": row["recommendedAction"]
        }
        
        print(f"\n[{i+1}/{total_logs}] {YELLOW}Sending...{RESET} Process: {BOLD}{log_payload['processName']}{RESET} (Score: {log_payload['anomalyScore']})")
        
        status_code, response = send_log_to_server(log_payload)
        
        if status_code == 201:
            sent_count += 1
            log_result = response.get("log", {})
            risk_score = log_result.get("riskScore", 0)
            severity = log_result.get("severity", "Info")
            
            # Severity color mapping
            sev_color = GREEN
            if severity == "Critical":
                sev_color = RED
            elif severity == "Warning":
                sev_color = YELLOW
                
            print(f"  {GREEN}➔ [SUCCESS] Response: 201 Created{RESET}")
            print(f"  {GREEN}➔ [Risk Assessment]{RESET} Score: {BOLD}{risk_score}{RESET} | Severity: {sev_color}{severity}{RESET}")
        else:
            print(f"  {RED}➔ [FAILED] Code: {status_code} | Reason: {response.get('message')}{RESET}")
            if status_code == 0:
                print(f"  {RED}Please ensure that the Express backend is running on http://localhost:5001!{RESET}")
                break
                
        time.sleep(1.0)

    print(f"\n{BOLD}{GREEN}================================================================{RESET}")
    print(f"  Sender finished. Successfully streamed {sent_count}/{total_logs} logs.")
    print(f"{BOLD}{GREEN}================================================================{RESET}")

if __name__ == "__main__":
    main()
