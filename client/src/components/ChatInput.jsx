import React from 'react'

function ChatInput() {
  return (
    <form className='w-full flex justify-center items-center'>
        <input placeholder='Send a message!' className='p-2 border-b-2 focus:outline-none w-80'/>
        <button type='submit'>Send</button>
    </form>
  )
}

export default ChatInput