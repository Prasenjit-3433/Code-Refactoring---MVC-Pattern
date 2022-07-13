function getSessionErrorData(req, defaultValues) {
  let sessionInputData = req.session.inputData;

  if (!sessionInputData) {
    sessionInputData = {
      hasError: false,
      ...defaultValues
    };

  }

  req.session.inputData = null;

  return sessionInputData;
}

function flashErrorToSession(req, data, action) {
    req.session.inputData = {
        hasError: true,
        message: "Invalid input - please check your data.",
        ...data
      };

    req.session.save(action);
}

module.exports = {
    getSessionErrorData: getSessionErrorData,
    flashErrorToSession: flashErrorToSession
};
