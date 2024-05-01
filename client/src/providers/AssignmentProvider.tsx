import React, { createContext, useState } from "react";

interface AssignmentProviderProps {
  children: React.ReactNode;
}

interface AssignmentContextProps {
  isPreviewAssignmentVisible: boolean;
  setIsPreviewAssignmentVisible: (isPreviewAssignmentVisible: boolean) => void;
  id: string | null;
  setId: (id: string) => void;
  title: string | undefined;
  setTitle: (title: string | undefined) => void;
  instructions: string | undefined;
  setInstructions: (instructions: string | undefined) => void;
  points: number;
  setPoints: (points: number) => void;
  dueDate: Date | null;
  setDueDate: (dueDate: Date) => void;
  topic: string | undefined;
  setTopic: (topic: string | undefined) => void;
  isAutomaticGradingEnabled: boolean;
  setIsAutomaticGradingEnabled: (isAutomaticGradingEnabled: boolean) => void;
  isAutomaticFeedbackEnabled: boolean;
  setIsAutomaticFeedbackEnabled: (isAutomaticFeedbackEnabled: boolean) => void;
  isEnabledPlagriasmChecker: boolean;
  setIsEnabledPlagriasmChecker: (isEnabledPlagriasmChecker: boolean) => void;
  typesOfQuestions: {
    "single-correct-type": number[];
    "multiple-correct-type": number[];
    "descriptive-type": number[];
    "numerical-type": number[];
  };
  setTypesOfQuestions: React.Dispatch<React.SetStateAction<{
    "single-correct-type": number[];
    "multiple-correct-type": number[];
    "descriptive-type": number[];
    "numerical-type": number[];
  }>>;
}

const AssignmentContext = createContext<AssignmentContextProps>({
  isPreviewAssignmentVisible: false,
  setIsPreviewAssignmentVisible: () => {},
  id: null,
  setId: () => {},
  title: undefined,
  setTitle: () => {},
  instructions: undefined,
  setInstructions: () => {},
  points: 0,
  setPoints: () => {},
  dueDate: null,
  setDueDate: () => {},
  topic: undefined,
  setTopic: () => {},
  isAutomaticGradingEnabled: false,
  setIsAutomaticGradingEnabled: () => {},
  isAutomaticFeedbackEnabled: false,
  setIsAutomaticFeedbackEnabled: () => {},
  isEnabledPlagriasmChecker: false,
  setIsEnabledPlagriasmChecker: () => {},
  typesOfQuestions: {
    "single-correct-type": [0, 0],
    "multiple-correct-type": [0, 0],
    "descriptive-type": [0, 0],
    "numerical-type": [0, 0],
  },
  setTypesOfQuestions: () => {},
});

const AssignmentProvider: React.FC<AssignmentProviderProps> = ({
  children,
}: AssignmentProviderProps) => {
  const [isPreviewAssignmentVisible, setIsPreviewAssignmentVisible] =
    useState<boolean>(false);
  const [id, setId] = useState<string | null>(null);
  const [title, setTitle] = useState<string | undefined>(undefined);
  const [instructions, setInstructions] = useState<string | undefined>(
    undefined
  );
  const [points, setPoints] = useState<number>(0);
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [topic, setTopic] = useState<string | undefined>(undefined);
  const [isAutomaticGradingEnabled, setIsAutomaticGradingEnabled] =
    useState<boolean>(false);
  const [isAutomaticFeedbackEnabled, setIsAutomaticFeedbackEnabled] =
    useState<boolean>(false);
  const [isEnabledPlagriasmChecker, setIsEnabledPlagriasmChecker] =
    useState<boolean>(false);
  const [typesOfQuestions, setTypesOfQuestions] = useState<{
    "single-correct-type": number[];
    "multiple-correct-type": number[];
    "descriptive-type": number[];
    "numerical-type": number[];
  }>({
    "single-correct-type": [0, 0],
    "multiple-correct-type": [0, 0],
    "descriptive-type": [0, 0],
    "numerical-type": [0, 0],
  });

  const modifyTypesOfQuestions = (
    type: keyof typeof typesOfQuestions,
    index: number,
    value: number
  ) => {
    setTypesOfQuestions((prev) => ({
      ...prev,
      [type]: prev[type].map((item, i) => (i === index ? value : item)),
    }));
  };

  return (
    <AssignmentContext.Provider
      value={{
        isPreviewAssignmentVisible,
        setIsPreviewAssignmentVisible,
        id,
        setId,
        title,
        setTitle,
        instructions,
        setInstructions,
        points,
        setPoints,
        dueDate,
        setDueDate,
        topic,
        setTopic,
        isAutomaticGradingEnabled,
        setIsAutomaticGradingEnabled,
        isAutomaticFeedbackEnabled,
        setIsAutomaticFeedbackEnabled,
        isEnabledPlagriasmChecker,
        setIsEnabledPlagriasmChecker,
        typesOfQuestions,
        setTypesOfQuestions,
      }}
    >
      {children}
    </AssignmentContext.Provider>
  );
};

export { AssignmentProvider, AssignmentContext };
