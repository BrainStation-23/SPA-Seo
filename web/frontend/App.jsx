import { BrowserRouter } from "react-router-dom";
import { NavigationMenu } from "@shopify/app-bridge-react";
import Routes from "./Routes";
import "./assets/style.css";
import "./assets/aistyle.css";

import {
  AppBridgeProvider,
  QueryProvider,
  PolarisProvider,
} from "./components";
import { ManagedUIContext } from "./contexts/ui.context";
import { ManagedHomeSeoContext } from "./contexts/home.context";
import { ManagedImageCompressionContext } from "./contexts/imageCompression.context";
import { ModalArea } from "./components/commonUI/Modal";
import { ToastContainer } from "./components/commonUI/Toast";
import { ManagedAIContext } from "./contexts/AI.context";

export default function App() {
  // Any .tsx or .jsx files in /pages will become a route
  // See documentation for <Routes /> for more info
  const pages = import.meta.globEager("./pages/**/!(*.test.[jt]sx)*.([jt]sx)");

  return (
    <ManagedUIContext>
      <ManagedAIContext>
        <ManagedImageCompressionContext>
          <ManagedHomeSeoContext>
            <PolarisProvider>
              <BrowserRouter>
                <AppBridgeProvider>
                  <QueryProvider>
                    <NavigationMenu
                      navigationLinks={[
                        {
                          label: "User manual",
                          destination: "/manual",
                        },
                      ]}
                    />
                    <Routes pages={pages} />
                    <ModalArea />
                    <ToastContainer />
                  </QueryProvider>
                </AppBridgeProvider>
              </BrowserRouter>
            </PolarisProvider>
          </ManagedHomeSeoContext>
        </ManagedImageCompressionContext>
      </ManagedAIContext>
    </ManagedUIContext>
  );
}
