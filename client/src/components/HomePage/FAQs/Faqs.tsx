import React, { useState } from "react";
import FaqList from "./FaqList";
import { Stack, Title } from "@mantine/core";
import Faq from "./Faq";

const Faqs: React.FC = () => {
  const [openedIndex, setOpenedIndex] = useState<number>(-1);
  return (
    <Stack gap={30} align="center" mt="30vh" id="faqs">
      <Title order={1}>FAQ</Title>
      {FaqList.map((faq, id) => (
        <Faq
          key={id}
          index={id}
          openedIndex={openedIndex}
          setOpenedIndex={setOpenedIndex}
          question={faq.question}
          answer={faq.answer}
        />
      ))}
    </Stack>
  );
};

export default Faqs;
