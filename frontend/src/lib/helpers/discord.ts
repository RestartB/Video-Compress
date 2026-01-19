function validateID(id: string) {
  return /^\d{15,20}$/.test(id);
}

export { validateID };
