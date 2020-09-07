# Qmoment 👋
![Version](https://img.shields.io/badge/version-0.0.0-blue.svg?cacheSeconds=2592000)

> Qmoment Server Side

### 🏠 [Homepage](https://github.com/hhssung/ProjectQ)


## Used

+ Node.js
+ Express framework

## 주요 기능

+ 기본 기능
  + JWT를 사용한 로그인, 회원가입, 비밀번호 변경
  + 비밀번호 분실 시 이메일로 랜덤한 비밀번호 전송
+ 관리자 페이지
  + 상품 정보 조회
  + 상품 신규 등록
  + 상품 영구 삭제 / 감추기
+ 상품/다이어리 관련
  + 상품/다이어리 목록 불러오기
  + 다이어리 내용 백업 (진행중)
  + 다이어리 영구 삭제
+ 상품 구독
+ 다이어리 web link 만들기
  + 내가 쓴 다이어리를 누구나 어디서든지 볼 수 있도록 html 파일로 만들기
  + 만든 html 파일 PDF로 변환 - (보안 문제, 서버 과부하 때문에 클라이언트에서 담당할 예정)
+ 일기 관련
  + 사용자가 오늘의 질문에 답을 한 지 3분이 경과하였을 경우, 해당 device로 푸시알림 보내기
+ 푸시알림
  + 매 분마다 푸시알림을 띄워야 되는 기기를 검색하여 전송 - (매 분마다 DB를 훑어야 되서 비효율적, 시간 간격을 늘려야 된다고 생각)

## Install

```sh
npm install
```

## Usage

```sh
npm start
```

## Author

👤 **변희성**

* Github: [@hhssung](https://github.com/hhssung)


***
_This README was generated with ❤️ by [readme-md-generator](https://github.com/kefranabg/readme-md-generator)_
