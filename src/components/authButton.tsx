import { Button } from "antd";
import { omit } from "lodash-es";
import { useVerification } from "@/hooks/useToken";

interface IAuthButtonProps {
  value: string;
  element: JSX.Element;
  text?: string;
}

export default function AuthButton(props: IAuthButtonProps) {
  const pass = useVerification(props.value);
  const buttonProps = omit(props, 'value', 'element', 'text');
  if(pass) {
    if(props.element) {
      return props.element;
    } else {
      return <Button {...buttonProps}>{props.text}</Button>
    }
  } else {
    return null;
  }
}