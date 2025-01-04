import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import { RFPercentage } from "react-native-responsive-fontsize";

const WIDTH = Dimensions.get("window").width;
const BUTTON_WIDTH = WIDTH / 4.5;

// IMPROVEMENT: define contants to improve readability
// define constants for valid choices to make it easier to change later
const CLEAR = "C";
const EQUALS = "=";
const ADDITION = "+";
const SUBTRACTION = "-";
const MULTIPLICATION = "x";
const DIVISION = "/";
const PERCENTAGE = "%";
const DECIMAL = ".";
const NEGATIVE = "+/-";

// group symbols and operators for easier handling
const OPERATORS = [ADDITION, SUBTRACTION, MULTIPLICATION, DIVISION];
const SYMBOLS = [NEGATIVE, DECIMAL, PERCENTAGE];
// IMPROVEMENT: END


export default function App() {
  const [answerValue, setAnswerValue] = useState("0");
  const [readyToReplace, setReadyToReplace] = useState(true);
  const [memoryValue, setMemoryValue] = useState(0);
  const [operatorValue, setOperatorValue] = useState(0);
  const [historyQueue, setHistoryQueue] = useState([]);

  /**
   * Represents row of buttons by passing values as children.
   */
  function ButtonRow(props) {

    let buttonsToCreate = props.children;

    let isFirstRow = props.firstRow ? true : false;

    return (
      <View style={styles.buttonsRow}>
        {buttonsToCreate.map((button, idx) => {

          let buttonStyle = styles.button;
          let lastButtonInRow = idx == buttonsToCreate.length-1?true:false;

          // top row needs to be light grey (except last button).
          if (isFirstRow && !lastButtonInRow) {
            buttonStyle = styles.topButton;
          }
          // last button in each row is blue.
          if (lastButtonInRow) {
            buttonStyle = styles.blueButton;
          }
          // 0 is a regular button w/ flex 2
          if (button.toString() == 0) {
            buttonStyle = [styles.button, { flex: 2 }];
          }

          return (
            <TouchableOpacity
              style={buttonStyle}
              onPress={() => buttonPressed(button)}
            >
              <Text style={styles.buttonFont}>{button.toString()}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  }

  /**
   * Handles number input and returns the new value
   */
  function handleNumber(value) {
    if (readyToReplace) {
      return value.toString();
    } else {
      return answerValue.toString() + value.toString();
    }
  }

  /**
   * Called when clear button is pressed
   */
  function clearPressed() {
    setAnswerValue("0");
    setMemoryValue(0);
    setOperatorValue(0);
    setReadyToReplace(true);
    if (answerValue == "0" && memoryValue == 0 && operatorValue == 0) {
      setHistoryQueue([]);
    }
  }

  /**
   * Stores the history of calculations
   */
  function storeHistory(value) {
    // only keep the last 3 calculations
    if (historyQueue.length >= 3) {
      historyQueue.shift();
    }
    historyQueue.push({ id: historyQueue.length, value: value });
  }

  /**
   * Called when equals button is pressed
   */
  function calculateEquals() {
    let previous = parseFloat(memoryValue);
    let current = parseFloat(answerValue);

    storeHistory(
      previous.toString() +
        " " +
        operatorValue.toString() +
        " " +
        current.toString()
    );
    setReadyToReplace(true);
    setMemoryValue(0);

    switch (operatorValue) {
      case ADDITION:
        return previous + current;
      case SUBTRACTION:
        return previous - current;
      case MULTIPLICATION:
        return previous * current;
      case DIVISION:
        return previous / current;
      default:
        console.log("invalid operator provided...");
        return;
    }
  }

  /**
   * called when button is pressed
   */
  function buttonPressed(value) {
    if (value === CLEAR) {
      clearPressed(); // reset state
    } else if (value === EQUALS) {
      // calculate the answer
      setAnswerValue(calculateEquals().toString());
    } else if (Number.isInteger(value)) {
      // handle number input
      setAnswerValue(handleNumber(value));
      setReadyToReplace(false);
    } else if (OPERATORS.includes(value)) {
      // handle operator input
      setMemoryValue(answerValue);
      setOperatorValue(value);
      setReadyToReplace(true);
    } else if (SYMBOLS.includes(value)) {
      // handle symbol input
      switch (value) {
        case NEGATIVE: // flip the sign
          setAnswerValue((parseFloat(answerValue) * -1).toString());
          break;
        case PERCENTAGE: // convert to percentage using specific formula
          setAnswerValue((parseFloat(answerValue) * 0.01).toString());
          break;
        case DECIMAL: // add decimal if not already present
          if (!answerValue.includes(".")) {
            setAnswerValue(answerValue + ".");
          }
          break;
        default:
          console.log("invalid symbol provided...");
          break;
      }
    }
  }

  // define calc button grid
  let calcButtons = [
    [CLEAR, NEGATIVE, PERCENTAGE, DIVISION],
    [7, 8, 9, MULTIPLICATION],
    [4, 5, 6, SUBTRACTION],
    [1, 2, 3, ADDITION],
    [0, DECIMAL, EQUALS]
  ];

  // render the calculator app
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      {/* IMPROVEMENT: add calculation history text */}
      <View style={styles.resultsContainer}>
        {historyQueue.map((item) => {
          return (
            <Text key={item.id} style={styles.historyText}>
              {item.value}
            </Text>
          );
        })}
        <Text style={styles.resultsText}>{answerValue}</Text>
      </View>
      {/* IMPROVEMENT: END */}

      {/* IMPROVEMENT: create cleaner code by avoiding duplication */}
      {calcButtons.map((row, idx) => {
        return <ButtonRow firstRow={idx == 0}>{row}</ButtonRow>;
      })}
      {/* IMPROVEMENT: END */}
    </SafeAreaView>
  );
}

// define reactive styling for the calculator app
const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    backgroundColor: "black",
  },
  resultsContainer: {
    flex: 4,
    justifyContent: "flex-end",
    alignContent: "bottom",
    paddingRight: "6%",
    paddingBottom: "5%",
    marginTop: "25%"
  },
  resultsText: {
    color: "white",
    fontSize: RFPercentage(10),
    textAlign: "right",
  },
  historyText: {
    color: "darkgray",
    fontSize: RFPercentage(3),
    textAlign: "right",
  },
  buttonsRow: {
    flex: 2,
    flexDirection: "row",
    margin: "1%",
  },
  topButton: {
    flex: 1,
    backgroundColor: "lightgray",
    height: BUTTON_WIDTH,
    width: BUTTON_WIDTH,
    borderRadius: BUTTON_WIDTH / 2,
    justifyContent: "center",
    alignItems: "center",
    margin: "1%",
  },
  blueButton: {
    flex: 1,
    backgroundColor: "#007bff",
    height: BUTTON_WIDTH,
    width: BUTTON_WIDTH,
    borderRadius: BUTTON_WIDTH / 2,
    justifyContent: "center",
    alignItems: "center",
    margin: "1%",
  },
  button: {
    flex: 1,
    backgroundColor: "#333333",
    height: BUTTON_WIDTH,
    width: BUTTON_WIDTH,
    borderRadius: BUTTON_WIDTH / 2,
    justifyContent: "center",
    alignItems: "center",
    margin: "1%",
  },
  buttonFont: {
    fontSize: RFPercentage(5),
    color: "white",
  },
});
