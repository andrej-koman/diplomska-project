import "./App.css";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "./components/ui/button";

function App() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>Login in to your account</CardDescription>
      </CardHeader>
      <CardContent></CardContent>
      <CardFooter>
        <Button>Log in</Button>
      </CardFooter>
    </Card>
  );
}

export default App;
