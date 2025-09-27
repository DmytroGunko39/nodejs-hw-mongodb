const parseType = (type) => {
  const allowedTypes = ['home', 'work', 'personal'];
  const value = type?.trim().toLowerCase();
  return allowedTypes.includes(value) ? value : undefined;
};

const parseBoolean = (value) => {
  if (typeof value === 'undefined') return undefined;
  const normalized = value.trim().toLowerCase();
  if (normalized === 'true') return true;
  if (normalized === 'false') return false;
  return undefined;
};

export const parseFilterParams = (query) => {
  const { contactType, isFavourite } = query;

  const parsedType = parseType(contactType);
  const parsedIsFavourite = parseBoolean(isFavourite);

  const filter = {};
  if (parsedType) filter.contactType = parsedType;
  if (typeof parsedIsFavourite === 'boolean')
    filter.isFavourite = parsedIsFavourite;
  return filter;
};
