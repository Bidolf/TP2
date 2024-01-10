from lxml import etree
from src.server.db_functions.retrieve_xml_group_by_file import retrieve_xml_group_by_file


def get_number_sightings_in_year(year, singleresult):
    data = []
    if singleresult:
        xml = retrieve_xml_group_by_file()
        if xml:
            for sub_xml in xml:
                count = 0
                root = etree.fromstring(sub_xml['sub_xml'])
                xpath_expr = f"//Sighting[DateTimeEncounter/Date[starts-with(text(), '{year}')]]"

                matching_sightings = root.xpath(xpath_expr)
                for sighting in matching_sightings:
                    count += 1
                data.append({'file_name': sub_xml['file_name'], 'count': count})
            if data:
                print("Data was successfully retrieved", flush=True)
                return data
            else:
                print("Unable to retrieve schema", flush=True)
                return data
        else:
            print("Unable to retrieve schema", flush=True)
            return data
    else:
        print("Unable to retrieve schema", flush=True)
        return data
