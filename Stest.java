import org.stringtemplate.v4.*;

class Stest {
  public static void main(String[] args) {
    STGroup group = new STGroupFile("/home/kajm/code/JavaScript/is-proj/templates/test.stg");
    ST dm = group.getInstanceOf("datamodel");
    ST incs = group.getInstanceOf("includes");
    ST vrp = group.getInstanceOf("vrp");
    ST mn = group.getInstanceOf("main");
    ST cat = group.getInstanceOf("cat");

    Integer[][] data = new Integer[][]{ 
      {0, 548, 776, 696, 582, 274, 502, 194, 308, 194, 536, 502, 388, 354, 468,
        776, 662},
      {548, 0, 684, 308, 194, 502, 730, 354, 696, 742, 1084, 594, 480, 674,
        1016, 868, 1210},
      {776, 684, 0, 992, 878, 502, 274, 810, 468, 742, 400, 1278, 1164, 1130,
        788, 1552, 754},
    };

    dm.add("matrix", data);
    dm.add("vehicles", 8);
    dm.add("start", 3);

    vrp.add("slack_max", 0);
    vrp.add("capacity", 3000);
    vrp.add("span_coefficient", 100);

    cat.add("a", incs.render());
    cat.add("b", dm.render());
    cat.add("c", vrp.render());
    cat.add("c", mn.render());

    System.out.println(cat.render());
  }
}
