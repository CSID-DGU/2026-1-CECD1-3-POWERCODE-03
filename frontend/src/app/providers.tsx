import type { PropsWithChildren } from "react";
import { Toaster } from "react-hot-toast";

export const AppProvider = ({ children }: PropsWithChildren) => {
  return (
    <>
      {children}
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 2400,
          style: {
            border: "1px solid #ebebeb",
            borderRadius: "12px",
            boxShadow: "0 12px 32px rgb(0 0 0 / 10%)",
            color: "#171717",
            fontSize: "13px",
          },
        }}
      />
    </>
  );
};
