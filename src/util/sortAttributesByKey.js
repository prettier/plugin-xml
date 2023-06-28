/**
 * 
 * @param {Array} attributes 
 * @returns {Array} a copy of attributes that has been sorted
 * 
 * <p> This is complicated because we need to parse the xmlns out of the
 * attribute keys, prioritize xmlns attributes first, and then order
 * accordingly. This is because I would like to extend this in the future to
 * prioritize certain keys within certain namespaces.
 */
function sortAttributes(attributes) {
    attributes.sort(([key1], [key2]) => {
      // Handle the highest priority attribute
      if (isXmlns(key1)) { 
        return -1; // param1 appears earlier when sorted
      } else if (isXmlns(key2)) { 
        return 1; // param1 appears later when sorted
      }

      if (containsNamespace(key1) && containsNamespace(key2)) {
        return compareTwoNamespacedAttributeKeys(key1, key2);
      }
      // Handle the 1 but not both containing a namespace
      if (containsNamespace(key1) && !containsNamespace(key2)) {
        return -1; // key1 appears earlier when sorted
      } else if (!containsNamespace(key1) && containsNamespace(key2)) {
        return 1; // key1 appears later when sorted
      }
      return standardComparison(key1, key2);
    })
  }
  
  /**
   * 
   * @param {String} key1 
   * @param {String} key2 
   * @returns {Number} a comparison value
   */
  function compareTwoNamespacedAttributeKeys(key1, key2) {
    const [ns1, k1] = key1.split(":");
    const [ns2, k2] = key2.split(":");
    // if namespaces are equal, simply compare keys
    if (ns1 === ns2) {
      return standardComparison(k1, k2);
    }
    // Handle the 1 but not both being an xmlns
    if (isXmlns(ns1) && !isXmlns(ns2)) {
      return -1; // key1 appears earlier when sorted
    } else if (!isXmlns(ns1) && isXmlns(ns2)) {
      return 1; // key1 appears later when sorted
    }
    return standardComparison(ns1, ns2);
  }
  
  /**
   * 
   * @param {String} key 
   * @returns {Boolean} whether or not that key is namespace-d
   */
  function containsNamespace(key) {
    return key.includes(":");
  }
  
  /**
   * 
   * @param {String} value 
   * @returns {Boolean} whether or not that value is xmlns
   */
  function isXmlns(value) {
    return value === "xmlns";
  }
  
  /**
   * 
   * @param {String} key1 
   * @param {String} key2 
   * @returns {Number} a comparison value
   */
  function standardComparison(key1, key2) {
    if (key1 < key2) { 
      return -1; // param1 appears earlier when sorted
    } else if (key1 > key2) {
      return 1; // param1 appears later when sorted
    } else {
      return 0;
    }
  }

  export default sortAttributes;