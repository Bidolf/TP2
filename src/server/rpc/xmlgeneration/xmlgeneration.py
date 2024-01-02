from .csv_to_xml_converter import CSVtoXMLConverter


def xmlgeneration():
    csv_path = "/csv/ufo-sightings.csv"
    xsd_path = "/xml/ufo_sightings.xsd"
    xml_path = "/xml/ufo-sightings.xml"

    print(f"csv file: {csv_path}", flush=True)
    print(f"xsd file: {xsd_path}", flush=True)
    print(f"xml file: {xml_path}", flush=True)

    converter = CSVtoXMLConverter(csv_path, xsd_path)

    xml_file = converter.to_xml_str()

    print("Writing xml file...", flush=True)
    with open(xml_path, "w", encoding='utf-8') as f:
        f.write(xml_file)
    print("File has been written", flush=True)
