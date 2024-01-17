import React from 'react'
import FaqList from './FaqList'
import { Stack, Title } from '@mantine/core'
import Faq from './Faq'

const Faqs:React.FC = () => {
  return (
    <Stack gap={30} align='center' mt='30vh'>
        <Title order={1}>FAQ</Title>
        {FaqList.map((faq)=><Faq question={faq.question} answer={faq.answer}/>)}
    </Stack>
  )
}

export default Faqs