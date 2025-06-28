import React from 'react'

const PageContainer = ({children}) => {
  return (
    <div className='flex justify-center items-center p-5 h-[calc(100vh-80px)]'>
        <div className='bg-white shadow-lg rounded-3xl max-w-5xl w-full p-5 px-10 h-full relative max-h-[calc(100vh-80px)]'>{children}</div>
    </div>
  )
}

export default PageContainer
