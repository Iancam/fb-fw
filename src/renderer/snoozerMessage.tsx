import React, { useState } from "react";
import moment from "moment";
import { getterSetter } from "../common/resources";

export interface SnoozeMessageProps {
  defaultMessage: string;
  snoozeMessage: (message: string, timeInHours: Date) => void;
  defaultWaitTime?: number;
}

const SnoozeMessage: React.SFC<SnoozeMessageProps> = ({
  snoozeMessage,
  defaultMessage,
  defaultWaitTime = 24
}) => {
  const messageGS = useState(defaultMessage);
  const [message] = messageGS;
  const waitTime = useState(defaultWaitTime);
  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === "Enter") {
      snoozeMessage(
        message,
        moment()
          .add(waitTime[0])
          .toDate()
      );
    }
  };

  const formElements: FormElementProps[] = [
    {
      label: "Snooze for x hours: ",
      inputProps: {
        getterSetter: waitTime,
        type: "number"
      }
    },
    // {
    //   label: "Ignore y hours after deadline: ",
    //   inputProps: {
    //     getterSetter: messageGS,
    //     type: "number",
    //   }
    // },
    {
      label: "Tell them: ",
      inputProps: {
        getterSetter: messageGS,
        type: "textarea",
        onKeyDown: handleKeyDown
      }
    }
  ];
  return (
    <div className="pa3 avenir bg-light-blue">
      {formElements.map(el => (
        <div className="db">{FormElement(el)}</div>
      ))}
    </div>
  );
};

type FormElementProps = {
  label: string;
  inputProps: {
    [x: string]: any;
    getterSetter: getterSetter<any>;
    type: string;
  };
};

const FormElement = ({ label, inputProps }: FormElementProps) => {
  const isTextArea = inputProps.type === "textarea";
  const [value, setValue] = inputProps.getterSetter || [undefined, undefined];
  const onChange = e => setValue(e.target.value);
  const inpProps = value ? { ...inputProps, onChange, value } : inputProps;
  return (
    <>
      <label className={"w-25"} htmlFor="label">
        {label}
      </label>
      {isTextArea ? (
        <textarea name={label} {...inpProps} />
      ) : (
        <input name={label} {...inpProps} />
      )}
    </>
  );
};

export default SnoozeMessage;
