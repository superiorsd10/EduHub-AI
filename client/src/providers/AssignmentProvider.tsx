import React, { createContext, useState } from "react";

interface AssignmentProviderProps {
  children: React.ReactNode;
}
interface AssignmentContextProps {
  isPreviewAssignmentVisible: boolean;
  setIsPreviewAssignmentVisible: (isPreviewAssignmentVisible:boolean)=>void;
}

const AssignmentContext = createContext<AssignmentContextProps>({
  isPreviewAssignmentVisible: false,
  setIsPreviewAssignmentVisible: ()=>{}
});

const AssignmentProvider: React.FC<AssignmentProviderProps> = ({
  children,
}: AssignmentProviderProps) => {
  const [isPreviewAssignmentVisible, setIsPreviewAssignmentVisible] =
    useState<boolean>(false);

  return (
    <AssignmentContext.Provider
      value={{
        isPreviewAssignmentVisible,
        setIsPreviewAssignmentVisible
      }}
    >
      {children}
    </AssignmentContext.Provider>
  );
};

export { AssignmentProvider, AssignmentContext };
