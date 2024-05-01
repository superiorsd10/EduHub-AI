import React, { createContext, useState } from "react";

interface AssignmentProviderProps {
  children: React.ReactNode;
}
interface AssignmentContextProps {
  isPreviewAssignmentVisible: boolean;
  setIsPreviewAssignmentVisible: (isPreviewAssignmentVisible:boolean)=>void;
  id: string | null;
  setId: (id:string)=>void;
}

const AssignmentContext = createContext<AssignmentContextProps>({
  isPreviewAssignmentVisible: false,
  setIsPreviewAssignmentVisible: ()=>{},
  id:null,
  setId:()=>{}
});

const AssignmentProvider: React.FC<AssignmentProviderProps> = ({
  children,
}: AssignmentProviderProps) => {
  const [isPreviewAssignmentVisible, setIsPreviewAssignmentVisible] =
    useState<boolean>(false);
  const [id,setId] = useState<string|null>(null);

  return (
    <AssignmentContext.Provider
      value={{
        isPreviewAssignmentVisible,
        setIsPreviewAssignmentVisible,
        id,
        setId
      }}
    >
      {children}
    </AssignmentContext.Provider>
  );
};

export { AssignmentProvider, AssignmentContext };
