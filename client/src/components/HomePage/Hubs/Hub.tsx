import React from 'react'

type Props = {}

const Hub = (props: Props) => {
  return (
    <Flex w="100vw" maw="100%" h={componentHeight} justify="flex-end">
          <motion.div
            initial={{ width: "94vw" }}
            animate={{ width: isDrawerOpen ? "83vw" : "94vw" }}
            transition={{ duration: 0.4 }}
          >
            {/* <Stack w="100%" h={componentHeight} justify="center" align="center">
              <Image
                h="50svh"
                src="/assets/LandingPageIllustration.png"
                style={{ objectFit: "contain" }}
              />
              <CreateHubModal opened={opened} close={close}/>
              <Group>
                <NextLink href="#">
                  <Button
                    onClick={open}
                    variant="default"
                    radius="md"
                    color="black"
                    style={{
                      borderColor: "none",
                      borderWidth: "0",
                      bg: "white",
                    }}
                  >
                    Create Hub
                  </Button>
                </NextLink>
                <NextLink href="#">
                  <Button color="black" radius='md'>Join Hub</Button>
                </NextLink>
              </Group>
            </Stack> */}
            <Flex w="100%" h={componentHeight} p="lg" gap="lg">
              <Card
                shadow="sm"
                padding="lg"
                radius="md"
                h="fit-content"
                w="20%"
                withBorder
              >
                <Card.Section
                  h="15vh"
                  bg="orange"
                  style={{ position: "relative" }}
                  withBorder
                >
                  <Group p="md" style={{position:'relative'}}>
                    <Stack >
                      <Group justify="space-between">
                        <Text color="white" size="xl">
                          Cryptography
                        </Text>
                        <FontAwesomeIcon
                          icon={faEllipsisVertical}
                          size="xl"
                          style={{
                            color: "#ffffff",
                            position: "absolute",
                            right: "10%",
                          }}
                        />
                      </Group>
                      <Text color="white" size="sm">
                        Dr. Dhananjoy Dey
                      </Text>
                    </Stack>
                  </Group>
                  <Divider
                    my="xs"
                    label={
                      <Avatar
                        size="lg"
                        src={auth.currentUser?.photoURL}
                        style={{marginRight:'-30%'}}
                      ></Avatar>
                    }
                  />
                </Card.Section>
                <Stack h="25vh"></Stack>
              </Card>
            </Flex>
          </motion.div>
        </Flex>
      )}
    </Flex>
  )
}

export default Hub