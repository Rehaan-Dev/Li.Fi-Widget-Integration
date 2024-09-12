import React, { useState, useRef } from "react";
import "./PaymentCardComponent.css"; // Importing component-specific CSS
import { AiOutlineCopy } from "react-icons/ai"; // Importing copy icon from react-icons
import { LazyLoadImage } from "react-lazy-load-image-component"; // For lazy loading images to improve performance
import Countdown, { zeroPad } from "react-countdown"; // Importing countdown for timer functionality
import { Tooltip } from "@mui/material"; // Importing tooltip for better user experience
import { CircularProgressbar, buildStyles } from "react-circular-progressbar"; // Circular progress bar component for countdown
import "react-circular-progressbar/dist/styles.css"; // Importing circular progress bar styles
import {
  ChainType,
  CoinKey,
  DisabledUI,
  HiddenUI,
  ItemPrice,
  LiFiWidget,
} from "@lifi/widget"; // Importing necessary LiFi widget components
import { lifiImage } from "../../../images/paymentSucessfull"; // Importing external image

// Custom completion component for countdown expiration
const Completionist = () => <span>Expired</span>;

// Renderer for countdown timer with a circular progress bar
const renderer = ({ hours, minutes, seconds, completed }) => {
  const totalTimeInSeconds = 2 * 60 * 60; // 2 hours in seconds
  const remainingTimeInSeconds = hours * 3600 + minutes * 60 + seconds;

  // Calculate percentage for the circular progress bar
  const percentage =
    ((totalTimeInSeconds - remainingTimeInSeconds) / totalTimeInSeconds) * 100;

  if (completed) {
    // If countdown is completed, render the expiration message
    return <Completionist />;
  } else {
    // If countdown is still running, render the time and progress bar
    const timeString = `${zeroPad(hours, 2)}:${zeroPad(minutes, 2)}:${zeroPad(
      seconds,
      2
    )}`;
    return (
      <div className="expiresTimerNumber">
        <div className="ProgressBarTimer">
          <CircularProgressbar
            value={percentage} // Setting the progress percentage
            text={`${timeString}`} // Displaying the time inside the progress bar
            strokeWidth={12} // Adjust thickness of the progress path
            styles={buildStyles({
              textSize: "11px",
              textColor: "#FF7200", // Text color inside progress bar
              textFamily: "Poppins", // Font family for text
              pathColor: "#F47224", // Path color of the progress
              trailColor: "#ffff", // Background color of the trail
            })}
          />
        </div>
      </div>
    );
  }
};

const PaymentCardComponent = ({
  fetching, // Boolean to indicate if fetching payment status
  coin, // Coin details (currency, chain)
  QrCode, // QR Code image source
  payAddress, // Payment address to send coins to
  payAmount, // Payment amount
  paymentStatus, // Status of the payment (e.g. "processing", "check")
  setInvoiceGenerated, // Function to control invoice generation
  timeOfGeneration, // Time of invoice generation to track countdown
  setOpen, // Function to handle modal opening
}) => {
  const input1Ref = useRef(null); // Ref for payment address input
  const input2Ref = useRef(null); // Ref for payment amount input

  const [copy1, setCopy1] = useState(false); // State to track if payment address is copied
  const [copy2, setCopy2] = useState(false); // State to track if payment amount is copied

  // Function to copy content to clipboard
  const handleCopyClick = (inputRef, setCopy) => {
    const inputValue = inputRef.current.value; // Get the value of the input
    const tempInput = document.createElement("input"); // Create a temporary input element
    tempInput.value = inputValue; // Assign the value to be copied
    document.body.appendChild(tempInput); // Add temp input to DOM
    tempInput.select(); // Select the value inside the input
    document.execCommand("copy"); // Execute copy command
    document.body.removeChild(tempInput); // Remove temp input from DOM
    setCopy(true); // Set copy state to true for the relevant field

    if (setCopy === setCopy1) {
      setCopy2(false); // Reset the second copy state if first is set
      handleButtonClick(); // Handle button click (copy animation)
    } else {
      setCopy1(false); // Reset the first copy state if second is set
      handleButtonClick2(); // Handle button click for second field
    }
  };

  // Handle expiration of the payment (e.g. after countdown completion)
  const handleExpired = () => {
    localStorage.setItem("orderId", JSON.stringify("")); // Clear order ID from localStorage
    setOpen(true); // Open modal for the user
    setInvoiceGenerated(false); // Mark invoice as not generated
  };

  // Tooltip and copy confirmation handling
  const [showTooltip, setShowTooltip] = useState(false);
  const [showTooltip2, setShowTooltip2] = useState(false);

  const handleButtonClick = () => {
    setShowTooltip(true); // Show tooltip for 1st copy
    setTimeout(() => {
      setShowTooltip(false); // Hide tooltip after 2 seconds
    }, 2000);
  };

  const handleButtonClick2 = () => {
    setShowTooltip2(true); // Show tooltip for 2nd copy
    setTimeout(() => {
      setShowTooltip2(false); // Hide tooltip after 2 seconds
    }, 2000);
  };

  // Handle external wallet link click
  const handleClick = () => {
    window.open(
      `https://link.trustwallet.com/send?asset=c195_tTR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t&address=${payAddress}&amount=${payAmount}&memo=test`,
      `_blank`
    );
  };


// LIFI WIDGET IMPLEMENTATION STARTS HERE 


  const contractCalls = []; // Contract calls for LiFi widget (if any)

  // Contract tool configuration for LiFi widget
  const contractTool = {
    logoURI:
      "https://github.com/lifinance/widget/assets/18644653/eb043a91-18ba-4da7-91c4-029a53a25989",
    name: "Evouchr Wallet",
  };

  // Widget configuration for LiFi widget
  const widgetConfig = {
    toAddress: {
      ...contractTool,
      address: payAddress, // Use provided pay address
      chainType: ChainType.EVM, // Specify blockchain type (EVM)
    },
    subvariant: "custom", // Custom variant for widget
    integrator: "Evouchr", // Integrator name
    disabledUI: [DisabledUI.ToAddress], // Disable UI for "ToAddress"
    hiddenUI: [HiddenUI.Appearance, HiddenUI.Language], // Hide certain UI elements
    useRecommendedRoute: true, // Use recommended route for transactions
    theme: {
      container: {
        border: `1px solid rgb(234, 234, 234)`, // Custom border
        borderRadius: "16px", // Custom border radius
      },
    },
  };

  const [showWidget, setShowWidget] = useState(false); // State to show/hide LiFi widget

  // Handle LiFi button click
  const handleBtnClick = () => {
    setShowWidget(!showWidget); // Toggle LiFi widget visibility
  };

  return (
    <>
      {/* Main container for payment card */}
      <div className="paymentCardMainContainer">
        
        {/* Step section to show progress of payment process */}
        <div className="paymentCardStepSsection">
          <div className="paymentCardSetpContainer">
            <div className="step">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="23"
                height="23"
                viewBox="0 0 23 23"
                fill="none"
              >
                <circle cx="11.5" cy="11.5" r="11.5" fill="#E8E8E8" />
                <circle cx="11.5" cy="11.5" r="8.5" fill="#979797" />
              </svg>
              <label htmlFor="step1" className="radio-label">
                Contact Information
              </label>
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="45"
              height="6"
              viewBox="0 0 45 6"
              fill="none"
            >
              <path
                d="M0.333333 3C0.333333 4.47276 1.52724 5.66667 3 5.66667C4.47276 5.66667 5.66667 4.47276 5.66667 3C5.66667 1.52724 4.47276 0.333333 3 0.333333C1.52724 0.333333 0.333333 1.52724 0.333333 3ZM39.3333 3C39.3333 4.47276 40.5272 5.66667 42 5.66667C43.4728 5.66667 44.6667 4.47276 44.6667 3C44.6667 1.52724 43.4728 0.333333 42 0.333333C40.5272 0.333333 39.3333 1.52724 39.3333 3Z"
                fill="#A5A5A5"
              />
              <path
                d="M42 3L3 3"
                stroke="#A5A5A5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          {/* Additional steps can go here */}
        </div>

        {/* QR code and payment address section */}
        <div className="QrCodeSection">
          <div className="QRCodeContainer">
            <LazyLoadImage
              alt={"QRCode"}
              className="QRCodeImg"
              effect="blur"
              src={QrCode} // Lazy loading of QR code image
            />
          </div>
          <div className="PaymentDetailsSection">
            <div className="AddressSection">
              <input
                ref={input1Ref} // Ref for copy functionality
                value={payAddress} // Payment address to be copied
                readOnly
              />
              <Tooltip
                open={showTooltip}
                title="Copied!"
                arrow
                placement="top"
              >
                <button
                  className="copyBtn"
                  onClick={() => handleCopyClick(input1Ref, setCopy1)}
                >
                  <AiOutlineCopy />
                </button>
              </Tooltip>
            </div>

            <div className="AmountSection">
              <input
                ref={input2Ref} // Ref for copy functionality
                value={payAmount} // Payment amount to be copied
                readOnly
              />
              <Tooltip
                open={showTooltip2}
                title="Copied!"
                arrow
                placement="top"
              >
                <button
                  className="copyBtn"
                  onClick={() => handleCopyClick(input2Ref, setCopy2)}
                >
                  <AiOutlineCopy />
                </button>
              </Tooltip>
            </div>
          </div>
        </div>

        {/* Timer section with countdown */}
        <div className="countdownTimer">
          <Countdown
            date={timeOfGeneration + 2 * 60 * 60 * 1000} // 2 hours countdown
            renderer={renderer} // Using the custom renderer for countdown
            onComplete={handleExpired} // Handle countdown completion
          />
        </div>



        {/* LiFi widget toggle section */}
        {coin?.lifi && (     // checking if the coin object has lifi boolean to be true 
        <div className="LiFiWidgetToggle">
            {/* Toggle button to show/hide the LiFi widget */}
            {!showWidget && (
            <button className="LiFiButton" onClick={handleBtnClick}>
                Show LiFi Widget  {/* Button to show the widget */}
            </button>
            )}

            {/* Conditional rendering of the LiFi widget based on toggle state */}
            {showWidget && (
            <>
            {/* LIFI Widget Integrated here with ITEM Price */}
               <LiFiWidget
                contractComponent={
                <ItemPrice
                  token={{
                    chainId: coin.chainId,    //chainId of the coin which is selected by user for example: 1 
                    address: coin.lifiToken,  // Token address of the coin which is selected by the user for example : 0x58efE15C0404aB22F87E4495D71f6f2077e862bE 
                    symbol: coin.currency,   // Name of the the coin which is selected by the user : USDT
                    name: coin.currency,    // Name of the the coin which is selected by the user : USDT
                    // decimals: 6,       
                    amount: BigInt(Math.round(payAmount * 1000000)),   // The Amount that user is supposed to pay for example the payAmount could be : 19.16
                    logoURI: coin.webImage,   // The Logo url of the coin selected 
                  }}
                  contractCalls={contractCalls}    // We are passing empty array here for contract calls 
                />
              }
              contractTool={contractTool}  // contract tool configuration as defined in line No : 138
              config={widgetConfig}    // widget configuration as defined in line No : 145
              integrator={widgetConfig.integrator}   // Integrator from widget configuration as defined in line No : 145
            />
            </>
            )}
        </div>
        )}
      </div>
    </>
  );
};

export default PaymentCardComponent;
