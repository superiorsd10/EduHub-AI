import React, { useState } from "react";
import { Stack, Title } from "@mantine/core";
import Faq from "./Faq";
import FaqList from "./FaqList";

const Faqs: React.FC = () => {
  const [openedIndex, setOpenedIndex] = useState<number>(-1);
  return (
    <Stack gap={30} align="center"  id="faqs">
      <Title order={1}>FAQs</Title>
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
