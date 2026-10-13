import OpenAI from "openai";
import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { output } from "three/tsl";

const openai=new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
})

//제공된 질문과 TXT파일(RAG)를 가지고 관련 단원을 검색하는 부분
const searchGuide=(question:string, guideText: string)=>{
    const normalize=(text:string)=>{
        return text.toLocaleLowerCase().replace(/\s+/g, '') //소문자로 바꾸기, 공백빼기, 정규식 나옴(공백 찾아서 다 없애 버리기=검색을 빠르게 하기 위해(컴퓨터가))
    }
    const useQuestion=normalize(question)

    //TXT파일을 단원별로 나누는 작업
    const sections=guideText.split(/(?=\[\d{2}\.s)/g) //txt파일에서 [대괄호\d{숫자2자리}.\s(공백)]가 나올때 나눈다 라는 뜻
    /*결과 예시
    [01. 홈페이지 소개] ------------sections[0]
    [02. 어쩌고 소개] ------------sections[1]
    [03. AI개념 설명] ------------sections[2]
    */

    const result:{
        text: string
        score: number
    }[]=[]   //result중 저수가 높은 것을 가져갈 것임
    //공통 규칙 가져오기---------------
    const commonRule=sections.find(
        item=> item.includes('[00. 챗봇 공통 답변 원칙]')
    )

    for(const item of sections){ //for of 문 : 자료 끝까지 찾는 놈/ 기본 for문은 배열이 생겨 불편
        if(item.includes('[00. 챗봇 공통 답변 원칙]')){
            continue
        }

        const title = item.match(/대표\s*명칭:\s*(.+)/); //공백 상관 없이 대표 명칭이란 글자를 찾으면 그 한줄을 다 갖고옴
        //title[0] ::: 한 줄 싹 가져옴
        //title[1] ::: 홈페이지 소개를 갖고옴

        const keywords=item.match(/관련\s*표현:\s*([\s\S]*?)(?=\n\s*\n|기능설명:)/)
        //기능설명이라는 글자가 나오기 전까지 줄도 공백도 상관없이 다 갖고오기 !!!!괄호는 한 묶음()
        /*keyword[0]관련 표현:AI퀴즈, ai퀴즈, QUIZE, 퀴즈, 문제, 문제풀기 등등
          keyword[1]AI퀴즈, ai퀴즈, QUIZE, 퀴즈, 문제, 문제풀기 등등----> 이거 전부words애 넣은거(아래)
        */

        const words=[title?.[1], ...(keywords?.[1].split(',') ||[])]
        //words[0]::홈페이지 소개, [1]::AI퀴즈, [2]::ai퀴즈

        let score=0;   //계속 바뀌니까 let으로
        for(const initem of words){
          const keyword=(initem)
          if(!keyword) continue
          if(useQuestion.includes(keyword)){
            score += keyword.length
          }
        }

        if(score>0){
            result.push({
                text:item,
                score:score
            })
        }
    }
    /*예상 결과: const result =[
    {text: 'AI퀴즈', score:30},
    {text: '(섹션안의 내용)', score:40},
    {text: '회원가입', score:50},
    {text: '로그인 설명', score:60},
    ]
    */
    result.sort((a,b)=>b.score-a.score)
    //관련성이 높은 단원 최대 3개 선택
const selected=result.slice(0,3).map(item=>item.text).join('\n\n') //\n\n는 줄바꿈
    /*
    ai퀴즈
    회원가입
    로그인설명
    */

    return commonRule + '\n\n'+selected
}
export const POST =async (req:Request )=>{ //req: fetch로 호출한 , POST방식으로 대답, 바디에 JSON으로 전송(question)을->이 전체를 req가 받는 것임
    try{
        const { question }=await req.json()  //프론트가 보내는 question을 여기로 받는 것임

        if(typeof question !== 'string'|| !question.trim()){
            return NextResponse.json(
                {err: '질문을 입력해 주세요'},
                {status: 400}
            )
        }

        //TXT파일을 한 섹션만 AI에게 던져주는 공간
        const filePath=path.join(
            process.cwd(), //프로젝트 최상위 경로의 파일을 가지고 옴-> 예: C:\Users\이젠\Desktop\portfoliolast/
            'public', 
            'data', 
            'myChatBot.txt' 
        )
        //파일을 진짜 읽는 부분
        const guideText=await readFile(
            filePath,
            'utf-8'
        )
       // 이제 검색 RAG로
const searchResult = searchGuide(question, guideText);

// 검색된 내용이 없으면 안내 메시지 반환
if (!searchResult.trim()) {
  return NextResponse.json({
    answer:
      "해당 내용을 찾지 못했습니다. React 학습, AI 퀴즈, 힌트, 로그인 기능 등을 질문해 주세요.",
  });
}

// OpenAI에게 전달
const response = await openai.responses.create({
  model: "gpt-4.1-mini",

  instructions: `당신은 React 학습 홈페이지의 안내 챗봇입니다.
  아래 검색된 홈페이지 안내자료만 참고하여 사용자의 질문에 답변하세요.

  답변 규칙
  1. 자료에 없는 기능을 만들어내지 마세요.
  2. 대소문자와 띄어쓰기의 차이를 무시하세요.
  3. 퀴즈와 문제처럼 비슷한 표현을 이해하세요.
  4. 짧고 간결하게 한국어로 대답하세요.
  5. 사용자가 이용 방법을 질문하면 순서대로 쉽게 설명하세요.

  [검색된 홈페이지 안내자료]
  ${searchResult}`,

  input: question,
});

// 프론트한테 넘기기
return NextResponse.json({
  answer: response.output_text,
})
    }catch(err){
        console.error('챗봇오류', err)
        return NextResponse.json(
            {error: 'ai답변 생성에 실패했습니다'},
            {status: 500}
        )
    }
}