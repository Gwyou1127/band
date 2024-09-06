import React, { useState, useEffect, useRef, Fragment } from 'react'
import { useParams } from 'react-router-dom'
import { useAppSelector, useAppDispatch } from '@zio/shared/redux/hooks'
import { setRoom } from '../../redux/slices/room'
import { setInputMessage } from '../../redux/slices/band'
import ContentBodyChatBubble from './contentBodyChatBubble'
import moment from 'moment'
import { RiChatVoiceFill, RiUserFollowLine, RiCloseLargeLine } from "react-icons/ri"
import { Spinner } from '@zio/components'


const ContentBodyChat = () => {
  const dispatch = useAppDispatch()
  const leftSidebar = useAppSelector((state)=>state.chatUI.leftSidebar)
  const params = useParams()  
  const paramsUserId = params?.userId
  const [allMessage,setAllMessage] = useState([])
  const {socketConnection, ...myUser } = useAppSelector((state)=>state.session)
  const inputMessage = useAppSelector(state=>state.band.inputMessage)
  const toUser = useAppSelector((state)=>state.room)  
  const currentMessage = useRef(null)

  console.log('inputMessage',inputMessage)

  useEffect(()=>{
    if (currentMessage.current){
      currentMessage.current?.scrollIntoView({block:'end'}) //behavior:'smooth'는 크롬에서 동작하지 않음
    }
  },[allMessage, inputMessage]) //전체 메세지 변경될때마다

  useEffect(()=>{
    console.log('대화상대(방)가 바뀔때 1회만 호출해야함',paramsUserId)
    if(socketConnection){
      // 1. 대화상대자 신상정보 물어보기
      socketConnection.emit('message-page',paramsUserId)
      // 1. 본 대화방 글 읽음여부 처리요청
      socketConnection.emit('seen',paramsUserId) // 대화상대가 작성한 글 읽음처리
      // 2. 대화상대 정보 수신
      socketConnection.on('message-user',(data)=>{
        dispatch(setRoom(data))
      })
    }
  },[paramsUserId]) // 대화 상대가 바뀔때만 실행

  useEffect(()=>{
    if(socketConnection){
      // 3. 대화상대와의 대화리스트 수신
      socketConnection.on('message',(data)=>{ // 이걸 왜 여러번 수신할까?
        console.log('데이타 수신은 중복 수신체크바람',data)
        console.log('paramsUserId',paramsUserId) //이 값이 undefined임 왜그럴까? 이유는 socketConnection 최초1회만 메모리에 떠있기때문
        console.log('dd',Object.keys(data).length)
        if (Object.keys(data).length===0){ // 값이 []일때 == 대화방이 없을 때
          setAllMessage(null)
        } else {
          setAllMessage(data)
        }
      })            
    }
  },[socketConnection]) // 소켓은 대화상대랑 상관없이 1번만 맺어지는것임. 메세지 수신은 소켓연결후 1번만 메모리에 위치, 중복호출되면, 소켓수신모듈이 여러개 생김^^

  const handleInputCancel = (key)=>{
    dispatch(setInputMessage({
      ...inputMessage,
      imageUrl: key==='imageUrl' ? "" : inputMessage?.imageUrl,
      videoUrl: key==='videoUrl' ? "" : inputMessage?.videoUrl
    }))
  }

  let isYmd = true, ymd = ""

  return (
    <div 
      className={`chat-group ${leftSidebar==='chat' ? "" : "d-none"}`}
      ref={currentMessage}
    >

      { // 대화상대자를 선택안했을 때
        !paramsUserId && (
          <div className="chat-group-divider"><RiUserFollowLine size={30}/><span className="p-2 fs-5">최근 대화 또는, 멤버를 선택하세요.</span></div>
        )
      }
      { // 대화상대자와 대화가 1건도 없을 때
        paramsUserId && !allMessage && (
          <div className="chat-group-divider text-success"><RiChatVoiceFill size={30}/><span className="p-2 fs-5">첫 대화를 시작해 보세요.</span></div>
        )
      }
      { // 그 동안 대화했던 내용 표시
        (allMessage?.sender === paramsUserId || allMessage?.receiver === paramsUserId) 
        && paramsUserId 
        && allMessage?.messages?.map((msg,index)=>{
          isYmd = ymd !== moment(msg.createdAt).format('YYYY-MM-DD')
          ymd = moment(msg.createdAt).format('YYYY-MM-DD')

          return(
            <ContentBodyChatBubble
                msg={msg}
                myUser={myUser}
                toUser={toUser}
                isYmd={isYmd}
            />
          )
        })
      } 
      { // 업로드하려는 이미지/동영상 미리보기
        inputMessage?.txt!=='loading' && inputMessage?.imageUrl && (
          <div className='d-flex w-100 h-100 mg-t-20 p-4 rounded overflow-hidden justify-content-center'>
            <div className='pd-l-20'>
              <img
                src={inputMessage?.imageUrl}
                className='img-thumbnail wd-100p'
              />
            </div>
            <div onClick={()=>handleInputCancel('imageUrl')} className='pd-l-15'>
              <RiCloseLargeLine size={30}/>
            </div>
          </div>
        )
      }
      {
        inputMessage?.text!=='loading' && inputMessage?.videoUrl && (
          <div className='d-flex w-100 h-100 mg-t-20 p-4 rounded overflow-hidden justify-content-center'>
            <div className='pd-l-20'>
              <video
                src={inputMessage?.videoUrl}
                className='img-thumbnail wd-100p'
                controls
                muted
                autoPlay
              />
            </div>
            <div onClick={()=>handleInputCancel('videoUrl')} className='pd-l-15'>
              <RiCloseLargeLine size={30}/>
            </div>
          </div>
        )
      }
      {
        inputMessage?.text==='loading' && (
          <div className='w-100 h-100 text-center'>
            <Spinner/>
          </div>
        )
      }      
    </div>
  )
}

export default ContentBodyChat