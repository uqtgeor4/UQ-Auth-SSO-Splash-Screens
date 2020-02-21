(function() {

  /** GLOBAL
   *  ------
   */

  var form                = document.getElementById("passwordResetForm"),
      labelDisabledClass  = "form__label--disabled",
      errorSummary        = document.getElementById("errorSummary");

  /** DETAILS
   * -------
   */
  var methodLegend        = document.getElementById("methodDesc"),
      methodEmailRad      = document.getElementById("methodEmail"),
      methodEmailRadVal   = 'email',
      methodEmailLabel    = document.getElementById("methodEmailLabel"),
      methodMobileRad     = document.getElementById("methodMobile"),
      methodMobileRadVal  = 'mobile',
      methodMobileLabel   = document.getElementById("methodMobileLabel"),
      methodError         = document.getElementById("methodError"),
      emailLabel          = document.getElementById("emailLabel"),
      emailInput          = document.getElementById("email"),
      emailError          = document.getElementById("emailError"),
      mobileLabel         = document.getElementById("mobileLabel"),
      mobileInput         = document.getElementById("mobile"),
      mobileError         = document.getElementById("mobileError"),
      usernameLabel       = document.getElementById("usernameLabel"),
      usernameInput       = document.getElementById("username"),
      usernameError       = document.getElementById("usernameError");

  // form errors
  var verificationMethodFormErrors = {};

  // form state
  var verificationMethodFormState = {};

  // validation schema (requires joi-browser)
  var verificationMethodSchema = Joi.object({
    username: Joi.string().required().error(function(errors) {
      errors.forEach(function(err) {
        err.message = "Enter your UQ username";
      });
      return errors;
    }),
    method: Joi.string().required().error(function(errors) {
      errors.forEach(function(err) {
        err.message = "Select a verification method to complete";
      });
      return errors;
    }),
    email: Joi.any().when('method', {
      is: methodEmailRadVal,
      then: Joi.string().empty("")
        .email({minDomainAtoms: 2})
        .regex(/^((?!(uq\.edu\.au)|(uqconnect.edu.au)|(uq\.net\.au)).)*$/i)
        .required()
    })
    .error(function(errors) {
      errors.forEach(function(err) {
        switch(err.type) {
          case "string.email":
            err.message = "Enter a valid email address. For example, name@gmail.com or name@outlook.com.";
            break;
          case "string.regex.base":
            err.message = "Enter a non-UQ email address";
            break;
          default:
            err.message = "Enter your personal email address";
        }
      });
      return errors;
    }),
    mobile: Joi.any().when('method', {
      is: methodMobileRadVal,
      then: Joi.string().empty("")
        .regex(/^(?:\+?61 ?|0)4 ?(?:(?:[01] ?[0-9]|2 ?[0-57-9]|3 ?[1-9]|4 ?[7-9]|5 ?[018]) ?[0-9]|3 ?0 ?[0-5])(?: ?[0-9]){5}$/)
        .required()
    })
    .error(function(errors) {
      errors.forEach(function(err) {
        switch(err.type) {
          case "string.regex.base":
            err.message = "Enter a valid Australian mobile number. For example, +61 4 XXXX XXXX or 04XX XXX XXX.";
            break;
          default:
            err.message = "Enter your mobile number";
        }
      });
      return errors;
    })
  });

  var setVerificationMethodFormErrors = function(joiResult) {
    // empty the error object
    verificationMethodFormErrors = {};
    
    // populate the errors based on error label
    if (joiResult.error) {
      joiResult.error.details.forEach(function(detail) {
        verificationMethodFormErrors[detail.context.label] = detail.message;
      });
    }
  };

  var handleChangeVerificationMethodDetail = function(key, labelElem, inputElem, errorElem) {
    return function(e) {
      
      // update the form state
      verificationMethodFormState[key] = e.target.value;
      var result = verificationMethodSchema.validate(verificationMethodFormState, {
        abortEarly: false
      });

      // update for errors
      setVerificationMethodFormErrors(result);
      
      // render inline errors
      renderVerificationMethodErrors(key, labelElem, inputElem, errorElem);
    };
  };

  var renderVerificationMethodErrors = function(errorKey, labelElem, inputElem, errorElem) {
    if (verificationMethodFormErrors[errorKey]) {
      labelElem.classList.add("form__label--error");
      inputElem.classList.add("form__input--error");
      inputElem.setAttribute("aria-invalid", "true");
      errorElem.classList.add("form__inline-error-message");
      errorElem.innerHTML = verificationMethodFormErrors[errorKey];
    } else {
      labelElem.classList.remove("form__label--error");
      inputElem.classList.remove("form__input--error");
      inputElem.setAttribute("aria-invalid", "false");
      errorElem.classList.remove("form__inline-error-message");
      errorElem.innerHTML = "";
    }
  };

  var handleMethodSelect = function(e) {
    if (methodEmailRad.checked) {
      // set method form state
      verificationMethodFormState.method = methodEmailRadVal;

      // clear mobile input
      mobileInput.value = "";
      var mobileChangeEvt = new Event('change');
      mobileInput.dispatchEvent(mobileChangeEvt);

      // disable/enable fields
      mobileInput.disabled = true;
      emailInput.disabled = false;

      // update CSS classes
      emailLabel.classList.remove(labelDisabledClass);
      mobileLabel.classList.add(labelDisabledClass);
    } else if (methodMobileRad.checked) {
      // set form state
      verificationMethodFormState.method = methodMobileRadVal;
      emailInput.value = "";

      var emailChangeEvt = new Event('change');
      emailInput.dispatchEvent(emailChangeEvt);

      // disable/enable
      emailInput.disabled = true;
      mobileInput.disabled = false;

      // update CSS classes
      emailLabel.classList.add(labelDisabledClass);
      mobileLabel.classList.remove(labelDisabledClass);
    }

    // run validation
    var result = verificationMethodSchema.validate(verificationMethodFormState, {
      abortEarly: false
    });
    
    setVerificationMethodFormErrors(result);
    renderMethodError();
  };

  var renderMethodError = function() {
    if (verificationMethodFormErrors.method) {
      methodLegend.classList.add("form__legend--error");
      methodEmailLabel.classList.add("form__label--error");
      methodMobileLabel.classList.add("form__label--error");
      methodEmail.classList.add("form__input--error");
      methodMobile.classList.add("form__input--error");
      methodEmail.setAttribute("aria-invalid", "true");
      methodMobile.setAttribute("aria-invalid", "true");
      methodError.classList.add("form__inline-error-message");
      methodError.innerHTML = verificationMethodFormErrors.method;
    } else {
      methodLegend.classList.remove("form__legend--error");
      methodEmailLabel.classList.remove("form__label--error");
      methodMobileLabel.classList.remove("form__label--error");
      methodEmail.classList.remove("form__input--error");
      methodMobile.classList.remove("form__input--error");
      methodEmail.setAttribute("aria-invalid", "false");
      methodMobile.setAttribute("aria-invalid", "false");
      methodError.classList.remove("form__inline-error-message");
      methodError.innerHTML = "";
    }
  };

  var handleVerificationMethodSubmit = function(e) {
    e.preventDefault();
    if (_.isEmpty(verificationMethodFormErrors)) {
      // submit the form
      form.submit();
    } else {
      // display error summary and all inline errors
      renderVerificationMethodErrorsummary();
      renderAllInlineVerificationMethodErrors();
      return false;
    }
  };

  var renderVerificationMethodErrorsummary = function() {
    errorSummary.innerHTML = "";
    var errorSummaryHeading = document.createElement("h2");
    errorSummaryHeading.className = "error-summary__title";
    errorSummaryHeading.innerText = "Your form could not be submitted";
    var errorSummaryBody = document.createElement("div");
    errorSummaryBody.className = "error-summary__body";
    var errorSummaryList = document.createElement("ul");
    errorSummaryList.className = "error-summary__list";
    var itemsToRenderProcess = [
      ["username", usernameInput.id],
      ["method", methodEmailRad.id],
      ["email", email.id],
      ["mobile", mobile.id]
    ];
    
    itemsToRenderProcess.forEach(function(item) {
      if (verificationMethodFormErrors[item[0]]) {
        var link = document.createElement("li");
        link.innerHTML = "<a href=\"#" +item[1]+ "\">" + verificationMethodFormErrors[item[0]] + "</a>";
        errorSummaryList.appendChild(link);
      }
    });

    // render
    errorSummaryBody.appendChild(errorSummaryHeading);
    errorSummaryBody.appendChild(errorSummaryList);
    errorSummary.appendChild(errorSummaryBody);
    errorSummary.classList.add("error-summary");
  };

  var renderAllInlineVerificationMethodErrors = function() {
    var itemsToRenderProcess = [
      ["username", usernameLabel, usernameInput, usernameError],
      ["email", emailLabel, emailInput, emailError],
      ["mobile", mobileLabel, mobileInput, mobileError]
    ];
    itemsToRenderProcess.forEach(function(item) {
      renderVerificationMethodErrors(item[0], item[1], item[2], item[3]);
    });
    renderMethodError();
  }

  var resetVerificationMethodState = function() {
    verificationMethodFormErrors = {},
    verificationMethodFormState = {};
    // init errors
    renderAllInlineVerificationMethodErrors();
    errorSummary.classList.remove("error-summary");
    errorSummary.innerHTML = "";
    var initErrorResults = verificationMethodSchema.validate(verificationMethodFormState, {
      abortEarly: false
    });
    setVerificationMethodFormErrors(initErrorResults);
    // reset to disabled
    emailInput.disabled = true;
    mobileInput.disabled = true;
  };

  var initVerificationMethod = function() {
    // init errors
    var initErrorResults = verificationMethodSchema.validate(verificationMethodFormState, {
      abortEarly: false
    });
    setVerificationMethodFormErrors(initErrorResults);

    // set up listeners
    methodEmailRad.addEventListener('change', handleMethodSelect);
    methodMobileRad.addEventListener('change', handleMethodSelect);
    emailInput.addEventListener('change', handleChangeVerificationMethodDetail('email', emailLabel, emailInput, emailError));
    mobileInput.addEventListener('change', handleChangeVerificationMethodDetail('mobile', mobileLabel, mobileInput, mobileError));
    usernameInput.addEventListener('change', handleChangeVerificationMethodDetail('username', usernameLabel, usernameInput, usernameError));
    passwordResetForm.addEventListener('submit', handleVerificationMethodSubmit);
    passwordResetForm.addEventListener('reset', function(e) {
      resetVerificationMethodState();
    });
  };
    
  // set up watch and init for verification method
  if (methodEmailRad && methodMobileRad) {
    initVerificationMethod();
  }

  /** CHOOSE A PASSWORD
    * -----------------
    */
  var passwordInput                     = document.getElementById("password"),
      passwordLabel                     = document.getElementById("passwordLabel"),
      passwordError                     = document.getElementById("passwordError"),
      confirmPasswordInput              = document.getElementById("confirmPassword"),
      confirmPasswordLabel              = document.getElementById("confirmPasswordLabel"),
      confirmPasswordError              = document.getElementById("confirmPasswordError"),
      passwordStrengthMeterText         = document.getElementById("passwordStrengthMeterText"),
      passwordStrengthMeterTextTemplate = document.getElementById("passwordStrengthMeterTextTemplate"),
      passwordStrengthMeter             = document.getElementById("passwordStrengthMeter");

  if (passwordStrengthMeter) {
    var indicators                      = passwordStrengthMeter.getElementsByTagName("span");
  }

  var passwordRegex = /^(?=.*[a-zA-Z])(?=.*[\d#$%'()*+,\-\/:;<=>\[\]^_`{|}~])(?!.*[&?!"@\\\s]).{8,40}$/,
      invertedAlphaRegex = /^(?!.*[a-zA-Z]).{1,}$/,
      invertedNonAlphaRegex = /^(?!.*[\d#$%'()*+,\-\/:;<=>\[\]^_`{|}~]).{1,}$/,
      invertedForbidden = /^(?=.*[&?!"@\\\s]).{1,}$/,
      strengthTerms = ['too guessable', 'very guessable', 'somewhat guessable', 'strong', 'very strong'];

      // form errors
  var choosePasswordFormErrors = {},
      // form state
      choosePasswordFormState = {},
      // validation schema (requires joi-browser)
      choosePasswordSchema = Joi.object({
        passwordStrength: Joi.any()
          .when('password', {
            is: Joi.string().empty("")
              .regex(passwordRegex, {invert: true})
              .optional(),
            then: Joi.any().optional(),
            otherwise: Joi.number()
              .min(2)
              .required() // must always be assessed by password strength library
              .label('password')
              .error(function(errors) {
                errors.forEach(function(err) {
                  err.message = "Enter a stronger password";
                });
                return errors;
            }
          )
        }),
        password: Joi.string().empty("")
          .min(8)
          .max(40)
          .regex(invertedAlphaRegex, {name: 'alpha', invert: true})
          .regex(invertedNonAlphaRegex, {name: 'nonAlpha', invert: true})
          .regex(invertedForbidden, {name: 'forbidden', invert: true})
          .required()
          .error(function(errors) {
            errors.forEach(function(err) {
              switch(err.type) {
                case "string.min":
                  err.message = "Your password is shorter than eight characters";
                  break;
                case "string.max":
                  err.message = "Your password is too long";
                  break;
                case "string.regex.invert.name":
                  switch(err.context.name) {
                    case "alpha":
                      err.message = "Your password does not contain a letter";
                      break;
                    case "nonAlpha":
                      err.message = "Your password does not contain a digit or allowed special character";
                      break;
                    case "forbidden":
                      err.message = "Your password contains a forbidden character: & ? ! \" @ \\ or a space";
                      break;
                  }
                  break;
                default:
                  err.message = "Enter a new password";
              }
            });
            return errors;
          }),
        confirmPassword: Joi.string().empty("")
          .valid(Joi.ref('password'))
          .required()
          .error(function(errors) {
            errors.forEach(function(err) {
              switch(err.type) {
                case "any.allowOnly":
                  err.message = "Your passwords don't match";
                  break;
                default:
                  err.message = "Confirm your new password by re-entering it";
              }
            });
            return errors;
          })
      });
  
  var setChoosePasswordFormErrors = function(joiResult) {
    // empty the error object
    choosePasswordFormErrors = {};
    
    // populate errors object w/ keys based on schema labels
    if (joiResult.error) {
      joiResult.error.details.forEach(function(detail) {
        var key = detail.context.label, value = detail.message;
        if (_.has(choosePasswordFormErrors, key)) {
          if (_.isArray(choosePasswordFormErrors[key])) {
            // if key already exists and values is array, add to array of strings
            choosePasswordFormErrors[key].push(value);
          } else {
            // if key already exists, convert value to array of strings
            choosePasswordFormErrors[key] = [choosePasswordFormErrors[key]];
            choosePasswordFormErrors[key].push(value);
          }
        } else {
          // otherwise set new error key
          choosePasswordFormErrors[key] = value;
        }
      });
    }
  };

  var handleChangePassword = function(key, labelElem, inputElem, errorElem) {
    return function(e) {
      
      // update the form state
      choosePasswordFormState[key] = e.target.value;
      var result = choosePasswordSchema.validate(choosePasswordFormState, {
        abortEarly: false
      });

      // map to error object
      setChoosePasswordFormErrors(result);
      
      // render inline errors
      renderChoosePasswordErrors(key, labelElem, inputElem, errorElem);
    };
  };

  var handleChangePasswordPreStep = function(e) {
    // clear all
    while (passwordStrengthMeterText.firstChild) {
      passwordStrengthMeterText.removeChild(passwordStrengthMeterText.firstChild);
    }
    for (var i = 0; i < 5; i++) {
      indicators[i].removeAttribute("class");
    }
    passwordStrengthMeter.setAttribute("class", "password-strength-meter-indicator");

    // check for criteria issues and password strength
    if (e.target.value.length > 0) {
      var clonedNode = passwordStrengthMeterTextTemplate.cloneNode(true);
      var clonedNodeScoreElem = clonedNode.querySelector(".password-strength-meter-text-rating");
      
      // display basic password criteria issues
      var match = e.target.value.match(passwordRegex);

      if (match == null) {
        // don't perform strength test if basic criteria is not met
        return false;
      }

      // run zxcvbn check (would be good to get some user related terms in there for checking)
      var result = zxcvbn(passwordInput.value);

      choosePasswordFormState.passwordStrength = result.score;

      // output zxcvbn results to user
      if (clonedNode) {
        if (clonedNodeScoreElem) {
          clonedNode.insertBefore(document.createTextNode("Your password is "), clonedNodeScoreElem);
          clonedNodeScoreElem.appendChild(document.createTextNode(strengthTerms[result.score]));
          if (result.score <= 2) {
            if (result.feedback.warning && result.feedback.warning !== "") {
              clonedNode.appendChild(document.createElement("br"));
              var warning = document.createElement("div");
              warning.setAttribute("class", "password-strength-meter-warning");
              warning.appendChild(document.createTextNode(result.feedback.warning));
              clonedNode.appendChild(warning);
            }
            if (result.feedback.suggestions && result.feedback.suggestions.length > 0) {
              var suggestions = document.createElement("ul");
              suggestions.setAttribute("class", "password-strength-meter-suggestions");
              for (var k = 0; k < result.feedback.suggestions.length; k++) {
                var suggestion = document.createTextNode(result.feedback.suggestions[k]),
                    suggestionElem = document.createElement("li");
                suggestionElem.appendChild(suggestion);
                suggestions.appendChild(suggestionElem);
              }
              clonedNode.appendChild(suggestions);
            }
            if (result.sequence && result.sequence.length > 0) {
              var sequences = document.createElement("ul");
              var count = 0;
              sequences.setAttribute("class", "password-strength-meter-sequences");
              for (var l = 0; l < result.sequence.length; l++) {
                var sequence,
                    sequenceElem = document.createElement("li"),
                    obfuscatedToken = result.sequence[l].token[0] + result.sequence[l].token.slice(1).replace(/./g, '*');
                switch(result.sequence[l].pattern) {
                  case "dictionary":
                    switch(result.sequence[l].dictionary_name) {
                      case "passwords":
                        sequence = document.createTextNode("Password contains a commonly used word or phrase: " + obfuscatedToken);
                        break;
                      case "female_names":
                        sequence = document.createTextNode("Password contains a name: " + obfuscatedToken);
                        break;
                      case "male_names":
                        sequence = document.createTextNode("Password contains a name: " + obfuscatedToken);
                        break;
                      default:
                        sequence = document.createTextNode("Password contains a common word or phrase: " + obfuscatedToken);
                    }
                    count++;
                    sequenceElem.appendChild(sequence);
                    sequences.appendChild(sequenceElem);
                    break;
                  case "sequence":
                    sequence = document.createTextNode("Password contains a sequence of characters: " + obfuscatedToken);
                    count++;
                    sequenceElem.appendChild(sequence);
                    sequences.appendChild(sequenceElem);
                    break;
                  case "repeat":
                    sequence = document.createTextNode("Password contains a repeated word, phrase, or sequence of characters: " + obfuscatedToken);
                    count++;
                    sequenceElem.appendChild(sequence);
                    sequences.appendChild(sequenceElem);
                }
              }

              if (count > 0) {
                clonedNode.appendChild(sequences);
              }
            }
            if (result.score <= 1) {
              clonedNode.setAttribute("class", "password-strength-meter-text password-strength-meter-text--fail");
              passwordStrengthMeter.setAttribute("class", "password-strength-meter-indicator password-strength-meter-indicator--fail"); 
            }
          } else {
            clonedNode.setAttribute("class", "password-strength-meter-text password-strength-meter-text--strong");
            passwordStrengthMeter.setAttribute("class", "password-strength-meter-indicator password-strength-meter-indicator--strong");
          }
          clonedNode.removeAttribute("id");
          clonedNode.style.display = "block";
          passwordStrengthMeterText.appendChild(clonedNode);
        }
      }

      if (indicators) {
        for (var m = 0; m < result.score + 1; m++) {
          indicators[m].setAttribute("class", "fill");
        }
      }

      return true;
    }
  }

  var renderChoosePasswordErrors = function(errorKey, labelElem, inputElem, errorElem) {
    if (_.has(choosePasswordFormErrors, errorKey)) {
      // set error state
      var error = choosePasswordFormErrors[errorKey];

      labelElem.classList.add("form__label--error");
      inputElem.classList.add("form__input--error");
      inputElem.setAttribute("aria-invalid", "true");
      errorElem.classList.add("form__inline-error-message");

      if (_.isArray(error)) {
        var error = error.join(",<br/>");
      }

      errorElem.innerHTML = error;
    } else {
      // remove error state
      labelElem.classList.remove("form__label--error");
      inputElem.classList.remove("form__input--error");
      inputElem.setAttribute("aria-invalid", "false");
      errorElem.classList.remove("form__inline-error-message");
      errorElem.innerHTML = "";
    }
  };

  var renderChoosePasswordErrorSummary = function() {
    errorSummary.innerHTML = "";
    var errorSummaryHeading = document.createElement("h2");
    errorSummaryHeading.className = "error-summary__title";
    errorSummaryHeading.innerText = "Your form could not be submitted";
    var errorSummaryBody = document.createElement("div");
    errorSummaryBody.className = "error-summary__body";
    var errorSummaryList = document.createElement("ul");
    errorSummaryList.className = "error-summary__list";
    
    // error keys to render
    var itemsToRenderProcess = [
      ["password", passwordInput.id],
      ["confirmPassword", confirmPasswordInput.id]
    ];
    
    itemsToRenderProcess.forEach(function(item) {
      var value = choosePasswordFormErrors[item[0]];
      if (value) {
        if (_.isArray(value)) {
          value.forEach(function(line) {
            var link = document.createElement("li");
            link.innerHTML = "<a href=\"#" +item[1]+ "\">" + line + "</a>";
            errorSummaryList.appendChild(link);
          });
        } else {
          var link = document.createElement("li");
          link.innerHTML = "<a href=\"#" +item[1]+ "\">" + value + "</a>";
          errorSummaryList.appendChild(link);
        }
      }
    });

    // render
    errorSummaryBody.appendChild(errorSummaryHeading);
    errorSummaryBody.appendChild(errorSummaryList);
    errorSummary.appendChild(errorSummaryBody);
    errorSummary.classList.add("error-summary");    
  };

  var renderAllInlineChoosePasswordErrors = function() {
    var itemsToRenderProcess = [
      ["password", passwordLabel, passwordInput, passwordError],
      ["confirmPassword", confirmPasswordLabel, confirmPasswordInput, confirmPasswordError],
    ];
    itemsToRenderProcess.forEach(function(item) {
      renderChoosePasswordErrors(item[0], item[1], item[2], item[3]);
    });
  };

  var handleChoosePasswordSubmit = function(e) {
    e.preventDefault();
    if (_.isEmpty(choosePasswordFormErrors)) {
      // submit the form
      form.submit();
    } else {
      // display error summary and all inline errors
      renderChoosePasswordErrorSummary();
      renderAllInlineChoosePasswordErrors();
      return false;
    }
  };

  var initChoosePassword = function() {
    // init errors
    var initErrorResults = choosePasswordSchema.validate(choosePasswordFormState, {
      abortEarly: false
    });
    setChoosePasswordFormErrors(initErrorResults);

    var passwordValidationFunc = handleChangePassword('password', passwordLabel, passwordInput, passwordError);
    passwordInput.addEventListener('input', _.throttle(function(e) {
      // run field validation and strength testing
      handleChangePasswordPreStep(e);
      passwordValidationFunc(e);
    }, 1200));
    confirmPasswordInput.addEventListener('change', handleChangePassword('confirmPassword', confirmPasswordLabel, confirmPasswordInput, confirmPasswordError));
    passwordResetForm.addEventListener('submit', handleChoosePasswordSubmit);
  };

  if (passwordInput) {
    initChoosePassword();
  }
})();
