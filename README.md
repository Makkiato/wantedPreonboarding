# wantedPreonboarding



사용자 관리
  간단하게 회원가입과 로그인만 가능하도록 준비
  로그인시 192bit 수준의 random key를 생성하고 이를 Cookie로 클라이언트에 전송
  이후 게시판 API 호출시마다 이 Cookie값을 이용해 사용자 인증 확인.
 
 
 게시판 관리
  게시판을 조회, 작성, 수정 할때, 매번 자신이 누구이고(id), 로그인을 완료한 인증(Cookie)를 함께 전송
  이를 통해 사용자 인증을 확인하고, 이후의 작업을 처리.
  
  
 endpoint 호출 및 api 
 프로토콜 : http
 기본 포트 : 8000
 content-type : application/json
  /signup
    POST : 회원가입 등록
      REQUEST
      body :  {
                "id" : 사용자 ID (STRING)
                "pw" : 사용자 Password (STRING)
              }
     RESPONSE
     code :
      201 - 회원가입 완료
      400 - payload 누락
      404 - 데이터베이스 상에서 오류(이미 등록된 회원, 자료형 불일치)
      
  /signin
    POST : 회원 로그인 수행   
      REQUEST
      body :  {
                "id" : 사용자 ID (STRING)
                "pw" : 사용자 Password (STRING)
              }
     RESPONSE
     code :
      201 - 로그인 완료
      400 - payload 누락
      404 - 데이터베이스 상에서 오류(등록되지 않은 회원, 자료형 불일치)
      
  /board
    POST : 게시글 작성    
      REQUEST
      body :  {
                "id" : 사용자 ID (STRING)
                "title" : 게시글 제목 (STRING)
                "head" : 게시글 말머리 (STRING, NULLABLE)
                "main" : 게시글 본문 (STRING)                
              }
      RESPONSE
       code :
        201 - 작성 완료
        400 - payload 누락
        401 - 인증 불일치
        404 - 데이터베이스 상에서 오류(자료형 불일치)
        
    GET : 게시글 목록, 본문 조회
      REQUEST
      body :  {
                "id" : 사용자 ID (STRING)
                "page" : 게시판 페이지 (INTEGER, NULLABLE, DEFAULT 1, > 0)
                "size" : 게시판 페이지 크기 (INTEGER, NULLABLE, DEFAULT 10, > 0)                
              }
      RESPONSE
       code :
        200 - 작성 완료
        401 - 인증 불일치
        404 - 데이터베이스 상에서 오류(자료형 불일치)
      
      payload :
        해당 범위의 게시글 목록 및 본문.
        num - 게시글 번호
        author - 작성자
        title - 제목
        head - 말머리
        main - 본문
        time - 등록 시각
              
    DELETE : 게시글 삭제
      REQUEST
      body :  {
                "id" : 사용자 ID (STRING)
                "num" : 게시글 번호 (INTEGER)         
              }
      RESPONSE
       code :
        202 - 삭제 대기중
        401 - 인증 불일치
        404 - 데이터베이스 상에서 오류(자료형 불일치)
              
    PUT : 게시글 수정
      REQUEST
      body :  {
                "id" : 사용자 ID (STRING)
                "num" : 게시글 번호 (INTEGER)         
                "change" : {
                              "title" : 변경 제목 (STRING, NULLABLE)
                              "head" : 변경 말머리 (STRING, NULLABLE)
                              "main" : 변경 본문 (STRING, NULLABLE)     
                            } : 변경사항
              }
      RESPONSE
       code :
        202 - 변경 완료
        401 - 인증 불일치
        404 - 데이터베이스 상에서 오류(자료형 불일치)
