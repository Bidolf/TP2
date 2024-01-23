from itertools import groupby
from operator import itemgetter
from db_functions.retrieve_xml_group_by_file import retrieve_xml_group_by_file

from lxml import etree


def retrieve_shape_region(shape, singleresult):
    retrieve_info = []
    data = []
    id_value = []
    if not singleresult:
        xml = retrieve_xml_group_by_file()
        if xml:
            for sub_xml1 in xml:
                root = etree.fromstring(sub_xml1['sub_xml'])
                id_value = root.xpath(f"/Ufo/Ufo-shapes/Ufo-shape[text()='{shape}']/@id")
            if id_value:
                for sub_xml in xml:
                    root = etree.fromstring(sub_xml['sub_xml'])
                    xpath_expr = f"/Ufo/Sightings/Sighting[@ufo_shape_ref = '{id_value[0]}']"
                    matching_sightings = root.xpath(xpath_expr)
                    if matching_sightings:
                        region_counts = {}
                        for sighting in matching_sightings:
                            element = sighting.find("Location/Region").text
                            if element == "":
                                region = "unknown"
                            else:
                                region = element
                            region_counts[region] = region_counts.get(region, 0) + 1

                        for region, count in region_counts.items():
                            retrieve_info.append({
                                'file_name': sub_xml['file_name'],
                                'region': region,
                                'UFOs_sightings': count,
                            })
                if retrieve_info:
                    grouped_info = {key: list(group) for key, group in groupby(retrieve_info, key=itemgetter('file_name'))}
                    for key, group in grouped_info.items():
                        grouped_info[key] = sorted(group, key=itemgetter('UFOs_sightings'))
                    print("Data was successfully retrieved")
                    return grouped_info
                else:
                    print("Unable to retrieve schema")
                    return data
            else:
                print("Unable to retrieve schema")
                return data
        else:
            print("Unable to retrieve schema")
            return data
    else:
        print("Unable to retrieve schema")
        return data
