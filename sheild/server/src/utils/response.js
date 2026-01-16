export const ok = (res, data = {}, message = 'OK') => {
  return res.status(200).json({ success: true, message, data });
};

export const created = (res, data = {}, message = 'Created') => {
  return res.status(201).json({ success: true, message, data });
};

export const badRequest = (res, message = 'Bad Request') => {
  return res.status(400).json({ message });
};

export const unauthorized = (res, message = 'Unauthorized') => {
  return res.status(401).json({ message });
};

export const notFound = (res, message = 'Not Found') => {
  return res.status(404).json({ message });
};

export const serverError = (res, error, message = 'Internal Server Error') => {
  return res.status(500).json({ message, error: error?.message || String(error) });
};


