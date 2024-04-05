import React from "react";
import { useDisclosure } from "@mantine/hooks";
import { Modal, Button, Title, Group, Stack, List, Text } from "@mantine/core";
import { FaCheck } from "react-icons/fa6";
import { PlanDetails } from "../PlanDetails";
import { loadStripe } from "@stripe/stripe-js";
import { useRouter} from "next/router";

type Props = {};

const UpgradePlan = ({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}) => {
  const { free, pro } = PlanDetails;
  const router = useRouter();

  const handleClickUpgrade = async () => {
    router.push('./checkout');
  };

  return (
    <>
      <Modal
        opened={isOpen}
        onClose={() => {
          setIsOpen(!isOpen);
        }}
        withCloseButton={false}
        size="75%"
        centered
      >
        <Title size="h4" mb="0">
          Upgrade your plan
        </Title>
        <Group justify="space-evenly" pt="lg" pb="xl" h="65vh">
          <Stack
            style={{ border: "1px solid black", borderRadius: "10px" }}
            w="45%"
            h="100%"
            p="2%"
          >
            <Title size="h5">Free</Title>
            <Title size="h5">USD O$/month</Title>
            <Button variant="outline" color="black" size="md">
              Your current plan
            </Button>
            <List>
              {free.map((feature: string) => (
                <Group align="flex-start">
                  <Text>
                    <FaCheck />
                  </Text>

                  <Text w="90%">{feature}</Text>
                </Group>
              ))}
            </List>
          </Stack>
          <Stack
            w="45%"
            h="100%"
            style={{ border: "1px solid black", borderRadius: "10px" }}
            p="2%"
          >
            <Title size="h5">Pro</Title>
            <Title size="h5">USD 20$/month</Title>
            <Button
              variant="filled"
              color="black"
              size="md"
              onClick={handleClickUpgrade}
            >
              Upgrade to Pro
            </Button>
            <List>
              <Text fw="bold">All of the benefits of free, and:</Text>
              {pro.map((feature: string) => (
                <Group align="flex-start">
                  <Text>
                    <FaCheck />
                  </Text>

                  <Text w="90%">{feature}</Text>
                </Group>
              ))}
            </List>
          </Stack>
        </Group>
      </Modal>
    </>
  );
};

export default UpgradePlan;
