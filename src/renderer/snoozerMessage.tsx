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
  const [message, setMessage] = messageGS;
  const waitTime = useState(defaultWaitTime);
  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === "Enter") {
      snoozeMessage(
        message,
        moment()
          .add(waitTime[0], "s")
          .toDate()
      );
      // setMessage("");
    }
  };
  const formElements: FormElementProps[] = [
    {
      label: "Snooze for x hours: ",
      getterSetter: waitTime,
      inputProps: {
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
      getterSetter: messageGS,
      inputProps: {
        type: "textarea",
        onKeyDown: handleKeyDown
      }
    }
  ];
  return (
    <div className="pa3 avenir bg-light-blue">
      {formElements.map((el, key) => (
        <div key={key} className="db">
          {FormElement(el)}
        </div>
      ))}
      <button
        onClick={() =>
          snoozeMessage(
            message,
            moment()
              .add(waitTime[0])
              .toDate()
          )
        }
      >
        Snooze
      </button>
    </div>
  );
};

type FormElementProps = {
  label: string;
  getterSetter: getterSetter<any>;
  inputProps: {
    [x: string]: any;
    type: string;
  };
};

const FormElement = ({ label, getterSetter, inputProps }: FormElementProps) => {
  const isTextArea = inputProps.type === "textarea";
  const [value, setValue] = getterSetter || [undefined, undefined];
  const onChange = (e: Event) => e && setValue(e.target.value);
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
